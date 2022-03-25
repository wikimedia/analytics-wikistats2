import _ from '../lodash-custom-bundle';
import utils from '../utils';
import config from 'Src/config';
import TimeRange from 'Src/models/TimeRange';
import Dimension from 'Src/models/Dimension';
import StatusOverlay from 'Src/components/StatusOverlay';
import AQS from 'Src/apis/aqs';
import AnnotationApi from 'Src/apis/annotation';

const splittingAllowedChecks = {
    'ONLY_IF_PER_DOMAIN': (p) => !utils.isProjectFamily(p),
};

class GraphModel {
    constructor (project, metric) {
        this.config = config.metricConfig(metric);
        this.metricId = metric;
        this.project = project;
        this.graphData = [];
        this.status = null;
        this.timeRange = TimeRange.getDefaultTimeRange(this.config);
        this.granularity = 'monthly';
        // After getting data, set this to a promise that fetches annotations with the api
        // The graphs can then use afterAnnotations to add a callback
        this.annotationPromise = null;

        this.breakdowns = utils.cloneDeep(this.config.breakdowns || []);
        this.dimensions = this.breakdowns.map(dimension => new Dimension(dimension));
        // insert a "total" breakdown as a default breakdown
        this.breakdowns.splice(0, 0, {
            total: true,
            name: 'Total',
            key: null,
            values: [
                { name: 'total', on: true, key: 'total' },
            ],
        })
        this.activeBreakdown = this.breakdowns[0];
        this.splitDimension = this.dimensions.find(dimension => dimension.splitting);

        // Unless we are modifying the dataset (i.e. with a cumulative metric),
        // datasetFunction returns the same data it's passed.
        this.datasetFunction = arg => arg;

        if (this.config.cumulative) {
            this.datasetFunction = GraphModel.ACCUMULATE;
        }
    }

    getFormattedTimeRange (explicit) {
        return this.timeRange.getFormattedTimeRange(this.granularity, this.config.structure, explicit);
    }

    setTimeRange (range) {
        this.timeRange = range;
        this.loadData();
    }

    setGranularity (granularity) {
        this.granularity = granularity;
        this.loadData();
    }

    setProject (project) {
        this.project = project;
        this.loadData();
    }

    availableGranularities () {
        return this.config.availableGranularities || ['monthly', 'daily'];
    }

    loadData (settings) {
        // Debouncing avoids requesting data additional times unnecessarily
        // when we're changing several attributes at the same time (granularity, range, etc).
        if(!this.debounced) this.debounced = _.debounce(() => {
            if (this.metricNotGlobalAndAllProjectsSelected(this.project)) {
                this.status = StatusOverlay.NON_GLOBAL(this.config.fullName);
                return;
            } else if (this.metricNotFamilyGlobalAndFamilySelected(this.project)) {
                this.status = StatusOverlay.NON_GLOBAL_FAMILY(this.config.fullName, this.project);
                return;
            }
            if (!this.splittingAllowed(this.project) && this.activeBreakdown.name !== 'Total') {
                this.preventUnallowedSplit();
            }
            const aqsApi = new AQS();
            const defaults = this.config.defaults || {
                unique: {},
                common: {}
            };
            let uniqueParameters = Object.assign(
                {},
                defaults.unique,
                {
                    project: [this.project]
                }
            );
            const getAll = this.config.cumulative;
            const requestInterval = this.timeRange;
            const commonParameters = Object.assign(
                {},
                defaults.common,
                {
                    start: requestInterval.start,
                    end: requestInterval.end,
                    granularity: this.granularity,
                    structure: this.config.structure,
                    timeRange: this.timeRange
                }
            );
            if (this.config.structure === 'top') {
                Object.assign(commonParameters, utils.getLastFullMonth(commonParameters.end));
            }

            let dataPromise = aqsApi.getData(uniqueParameters, commonParameters, this.dimensions);
            this.status = StatusOverlay.LOADING;

            dataPromise.catch((req, status, error) => {
                this.status = StatusOverlay.getMessageForStatus(req.status);
            });
            dataPromise.then(dimensionalData => {
                if (dimensionalData.getAllItems().length === 0) {
                    this.status = StatusOverlay.NO_DATA;
                } else {
                    this.status = null;
                    this.setData(dimensionalData);
                    if (settings && settings.annotations !== false) {
                        this.annotationPromise = new AnnotationApi().getAnnotations(this);
                    }
                }
            });
        }, 1)
        this.debounced();
    }

    metricNotFamilyGlobalAndFamilySelected (project) {
        return (!this.config.globalFamily && utils.isProjectFamily(project));
    }

    metricNotGlobalAndAllProjectsSelected () {
        return (!this.config.global && this.project === config.ALL_PROJECTS);
    }

    preventUnallowedSplit () {
        this.activeBreakdown = this.getDefaultBreakdown();
    }

    splittingAllowed () {
        if (!this.dimensions || this.dimensions.length < 1) {
            return false;
        }
        const check = this.config.splittingCheck;
        return !check || splittingAllowedChecks[check](this.project);
    }

    setData (data, dimensions) {
        this.data = data;
        let xAxisValue = 'timestamp';
        const yAxisValue = this.config.value;

        if (this.config.structure === 'top') {
            xAxisValue = this.config.key;
            this.graphData = this.topXByY(xAxisValue, yAxisValue).map(row => {
                row.total = row[yAxisValue]
                row.month = utils.createDate(row.timestamp);
                row.timeRange = timestampToTimeRange(row.timestamp, this.granularity);
                delete row[yAxisValue];
                return row;
            });
            return;
        } else {
            this.data.measure(xAxisValue);
            const filterAndSplitValues = this.data.filterSplit(this.dimensions, this.config.value);
            const sorted = _.sortBy(filterAndSplitValues, row => row.timestamp);
            const rawValues = this.datasetFunction(sorted);
            const graphFormattedData = rawValues.map((row) => {
                var ts = row.timestamp;
                const month = utils.createDate(ts);
                const timeRange = timestampToTimeRange(ts, this.granularity);
                return {month: month, total: row[yAxisValue], timeRange: timeRange};
            });
            this.graphData = this.cutForTimerange(graphFormattedData, this.timeRange);
            //this.timeRange.end = this.graphData[this.graphData.length - 1].timeRange.end;

            if (this.config.truncatedThreshold) {
                this.fillTruncatedValues();
            }
        }

    }

    topXByY (valueColumn, measureColumn) {
        // Value column is the name of the thing that is being ranked (articles, user names, countries)
        const formattedData = this.data.filterSplit(this.dimensions, measureColumn, valueColumn);
        const sorted = _.sortBy(formattedData, row => row[measureColumn].total).reverse();
        const timestamp = this.data.getAllItems()[0].timestamp;
        const rankedAndTimestamped = sorted.map((row, i) => {
            row.rank = i + 1;
            row.timestamp = timestamp;
            return row;
        });
        return rankedAndTimestamped;
    }

    hasTruncatedValues () {
        return !!this.graphData.find(v => v.truncated);
    }

    fillTruncatedValues () {
        const datesMatch = (d1, d2) => {
            if (this.granularity === 'monthly') {
                return d1.getUTCFullYear() === d2.getUTCFullYear() &&
                d1.getUTCMonth() === d2.getUTCMonth()
            } else {
                return d1.getUTCFullYear() === d2.getUTCFullYear() &&
                d1.getUTCMonth() === d2.getUTCMonth() &&
                d1.getUTCDate() === d2.getUTCDate()
            }
        };
        let i = 0;
        const span = this.timeRange.getSpan(this.granularity);
        while (i < span - 1) { // Removing the last day so we don't fill the end of the dataset.
            const zeroedItem = JSON.parse(JSON.stringify(this.graphData[0]));
            zeroedItem.total = {};
            zeroedItem.timeRange.start = utils.createDate(zeroedItem.timeRange.start);
            Object.keys(this.graphData[0].total).forEach(k => zeroedItem.total[k] = 0);
            const previousItem = this.graphData[i - 1];
            const item = this.graphData[i];
            let expectedDate;
            if (i === 0) {
                expectedDate = this.timeRange.start;
            } else {
                expectedDate = new Date(previousItem.timeRange.start);
                if (this.granularity === 'monthly') {
                    expectedDate.setUTCMonth(expectedDate.getUTCMonth() + 1);
                } else {
                    expectedDate.setUTCDate(expectedDate.getUTCDate() + 1);
                }
            }
            if (!item || !datesMatch(expectedDate, item.timeRange.start)) {
                const timeRange = timestampToTimeRange(expectedDate, this.granularity);
                const valueToAdd = Object.assign(zeroedItem, {timeRange: timeRange, month: expectedDate, truncated: true});
                this.graphData.splice(i, 0, valueToAdd);
            }
            i++;
        }
    }

    cutForTimerange (data, timeRange) {
        if (!timeRange) return data;
        return data.filter(item =>
            item.timeRange.start >= timeRange.start &&
            item.timeRange.start <= timeRange.end
        );
    }

    /** Data for downloading as csv needs to be a flat key/value pair object **/
    downloadData(){
        let jsonData = JSON.parse(JSON.stringify(this.graphData));
        // data is an array of objects that might be deeply nested (with more than 1 level)
        let flatJSONData = []
        _.forEach(jsonData, function(item){
            flatJSONData.push(flatten(item));
        });
        return flatJSONData;
    }

    get area () {
        return this.config.area;
    }
    get darkColor () {
        return this.config.darkColor;
    }
    get syntheticAll () {
        return this.config.syntheticAll ?? false;
    }

    getAggregateLabel () {
        return this.config.additive ? 'Total' : 'Average';
    }

    hasAggregate () {
        return this.config.structure === 'timeseries' ||
              (this.config.structure === 'top' && this.syntheticAll)
    }

    getAggregate () {
        return this.getLimitedAggregate();
    }

    getDefaultBreakdown () {
        // The default breakdown is always index 0 (see constructor)
        return this.breakdowns[0];
    }
    getLimitedAggregate (limitToLastN) {
        const values = this.getAggregatedValues(limitToLastN);
        const total = _.sum(values);
        const average = _.round(total / values.length, 1);

        return this.config.additive ? total : average;
    }

    getAggregatedValues (limitToLastN) {
        const values = this.graphData.map((d) => {
            return _.sum(_.map(d.total, (dimensionValue, key) => dimensionValue));
        });
        const limit = Math.min(limitToLastN || values.length, values.length);
        return _.takeRight(values, limit);
    }

    getActiveDimensionValues () {
        const splittingDimension = this.dimensions.find(d => d.active);
        const actives = splittingDimension.values.filter(bv => bv.on).map(bv => bv.key);
        return actives.reduce((r, a) => { r[a] = true; return r; }, {});
    }

    activateBreakdownIfAvailable (breakdown) {
        const found = _.find(this.breakdowns, b => b.key === breakdown.key);
        if (found) {
            found.values.forEach(bv => {
                const foundValue = _.find(breakdown.values, x => x.key === bv.key);
                bv.on = foundValue ? foundValue.on : false;
            });
            this.activeBreakdown = found;
        }
    }

    getMinMax () {
        if (this.config.structure === 'top') {
            const sorted = _.sortBy(this.graphData, row => row.rank);
            return {
                min: sorted[sorted.length - 1].total.total,
                max: sorted[0].total.total
            }
        }

        let min = 0;
        let max = 0;

        const splittingDimension = this.dimensions.find(d => d.splitting);
        const activeSplitValues = splittingDimension ? splittingDimension.values.filter(v => v.on).map(v => v.key) : ['total'];
        _.forEach(this.graphData, d => {
            const active = _.toPairs(d.total).filter(r => activeSplitValues.find(v => v === r[0])).map(r => r[1]);
            min = Math.min(min, _.min(active));
            max = Math.max(max, _.max(active));
        });

        return { min, max };
    }

    afterAnnotations (callback) {
        if (this.annotationPromise) {
            this.annotationPromise.then(callback);
        }
    }

    static ACCUMULATE (rawValues) {
        return rawValues.reduce((p, c) => {
            const valueName = Object.keys(rawValues[0]).filter(key => key != 'timestamp')[0];
            const newValue = {
                timestamp: c.timestamp
            }
            newValue[valueName] = {};
            const splits = rawValues[0][valueName];
            for (const split in splits) {
                const lastValue = p[p.length - 1];
                if (lastValue) {
                    newValue[valueName][split] = lastValue[valueName][split] + c[valueName][split];
                } else {
                    newValue[valueName][split] = c[valueName][split];
                }
            }
            p.push(newValue);
            return p;
        }, []);
    }
}
/**
* Dates come from AQS in the form of timestamps indicating the beginning of the
* day/month. This function turns them to time ranges.
**/
function timestampToTimeRange (timestamp, granularity) {
    const startDate = TimeRange.createDate(timestamp);
    if (granularity === 'monthly') {
        const beginningOfNextMonth = TimeRange.beginningOfNextMonth(timestamp);
        return new TimeRange([startDate, beginningOfNextMonth]);
    } else if (granularity === 'daily') {
        const beginningOfNextDay = TimeRange.beginningOfNextDay(timestamp);
        return new TimeRange([startDate, beginningOfNextDay]);
    }
}


/**
* Convert an nested object in a set of flat key value pairs
* {some: { a:1, b:2 }} will be converted to {some.a :1, some.b:2}
**/
function flatten(obj) {
    let accumulator = {};

    function _flatten(obj, keyPrefix) {

         _.forEach(obj, function(value, key){

            if (typeof(obj[key]) === 'object'){
                _flatten(obj[key], key);

            } else {
                !keyPrefix ? accumulator[key] = value : accumulator[keyPrefix +'.'+ key] = value;
            }
        })
    }
    _flatten(obj);
    return accumulator;
}

export default GraphModel;

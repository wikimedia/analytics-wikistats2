import _ from '../lodash-custom-bundle';
import utils from '../utils';
import config from 'Src/config';
import TimeRange from 'Src/models/TimeRange';
import StatusOverlay from 'Src/components/StatusOverlay';
import AQS from 'Src/apis/aqs';
import AnnotationApi from 'Src/apis/annotation';

const breakdownChecks = {
    'ONLY_IF_PER_DOMAIN': (p) => !utils.isProjectFamily(p),
};

class GraphModel {
    constructor (project, metric) {
        this.config = config.metricConfig(metric);
        this.project = project;
        this.graphData = [];
        this.status = null;
        this.timeRange = TimeRange.getDefaultTimeRange(this.config);
        this.granularity = 'monthly';
        // After getting data, set this to a promise that fetches annotations with the api
        // The graphs can then use afterAnnotations to add a callback
        this.annotationPromise = null;

        this.breakdowns = utils.cloneDeep(this.config.breakdowns || []);
        // insert a "total" breakdown as a default breakdown
        this.breakdowns.splice(0, 0, {
            total: true,
            name: 'Total',
            // this undefined is meaningful as a second parameter to DimensionalData.breakdown
            breakdownName: null,
            values: [
                { name: 'total', on: true, key: 'total' },
            ],
        })
        this.activeBreakdown = this.breakdowns[0];

        // Unless we are modifying the dataset (i.e. with a cumulative metric),
        // datasetFunction returns the same data it's passed.
        this.datasetFunction = arg => arg;

        if (this.config.cumulative) {
            this.datasetFunction = GraphModel.ACCUMULATE;
        }
    }

    getFormattedTimeRange () {
        return this.timeRange.getFormattedTimeRange(this.granularity, this.config.structure);
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
            if (!this.breakdownAllowed(this.project) && this.activeBreakdown.name !== 'Total') {
                this.preventUnallowedBreakdown();
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
            const breakdown = this.activeBreakdown;
            if (breakdown && !breakdown.total) {
                let breakdownKeys = breakdown.values.filter(bv => bv.on).map(bv => bv.key);

                // in this case, the user de-selected the last value, toggle back to Total
                if (!breakdownKeys.length) {
                    // also re-select everything otherwise this will loop
                    // to see what I mean, try deleting the next line and de-selecting all values
                    breakdown.values.forEach(bv => bv.on = true);
                    this.activeBreakdown = this.breakdowns[0];
                    return;
                }
                uniqueParameters[breakdown.breakdownName] = breakdownKeys;
            }

            let dataPromise = aqsApi.getData(uniqueParameters, commonParameters);
            this.status = StatusOverlay.LOADING;

            dataPromise.catch((req, status, error) => {
                this.status = StatusOverlay.getMessageForStatus(req.status);
            });
            dataPromise.then(dimensionalData => {
                if (dimensionalData.getAllItems().length === 0) {
                    this.status = StatusOverlay.NO_DATA;
                }
                this.status = null;
                this.setData(dimensionalData);
                if (settings && settings.annotations !== false) {
                    this.annotationPromise = new AnnotationApi().getAnnotations(this);
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

    preventUnallowedBreakdown () {
        this.activeBreakdown = this.getDefaultBreakdown();
    }

    breakdownAllowed () {
        if (!(this.breakdowns) || !(this.breakdowns.length > 1)) {
            return false;
        }

        const check = this.config.breakdownCheck;
        return !check || breakdownChecks[check](this.project);
    }

    setData (data) {
        this.data = data;

        const xAxisValue = 'timestamp';
        const yAxisValue = this.config.value;


        if (this.config.structure === 'top') {
            this.graphData = topXByY(this.data, this.config).map(row => {

                row.total = {
                    total: row[yAxisValue]
                };
                row.month = utils.createDate(row.timestamp);

                delete row[yAxisValue];
                return row;
            });
            return;
        } else {
            this.data.measure(xAxisValue);
            const rawValues = this.datasetFunction(
                this.data.breakdown(yAxisValue, this.activeBreakdown.breakdownName)
            );
            this.graphData = this.cutForTimerange(rawValues.map((row) => {
                var ts = row.timestamp;
                const month = utils.createDate(ts);
                return {month: month, total: row[yAxisValue]};
            }), this.timeRange);

        }

    }

    cutForTimerange (data, timeRange) {
        if (!timeRange) return data;
        return data.filter(item => item.month >= timeRange.start && item.month <= timeRange.end);
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

    getAggregateLabel () {
        return this.config.additive ? 'Total' : 'Average';
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
        const activeDict = this.getActiveBreakdownValues();
        const values = this.graphData.map((d) => {
            return _.sum(_.map(d.total, (breakdownValue, key) => {
                return key in activeDict ? breakdownValue : 0;
            }));
        });
        const limit = Math.min(limitToLastN || values.length, values.length);
        return _.takeRight(values, limit);
    }

    getChangeOverRange () {
        const data = this.getAggregatedValues();
        if (data[0] == 0 || data.length == 0) return null;
        return ((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(2);
    }

    getActiveBreakdownValues () {
        const actives = this.activeBreakdown.values.filter(bv => bv.on).map(bv => bv.key);
        return actives.reduce((r, a) => { r[a] = true; return r; }, {});
    }

    activateBreakdownIfAvailable (breakdown) {
        const found = _.find(this.breakdowns, b => b.breakdownName === breakdown.breakdownName);
        if (found) {
            found.values.forEach(bv => {
                const foundValue = _.find(breakdown.values, x => x.key === bv.key);
                bv.on = foundValue ? foundValue.on : false;
            });
            this.activeBreakdown = found;
        }
    }

    getMinMax () {
        const activeDict = this.getActiveBreakdownValues();
        if (this.config.structure === 'top') {
            const sorted = _.sortBy(this.graphData, row => row.rank);
            return {
                min: sorted[sorted.length - 1].total.total,
                max: sorted[0].total.total
            }
        }

        let min = 0;
        let max = 0;

        _.forEach(this.graphData, d => {
            const active = _.toPairs(d.total).filter(r => r[0] in activeDict).map(r => r[1]);
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
* Stateless function that pivots the data
**/
function topXByY (data, config) {
        const x = config.key;
        const y = config.value;
        data.measure(x);
        const results = data.breakdown(y);
        return _.take(_.sortBy(results, (row) => row[y]).reverse(), results.length);
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

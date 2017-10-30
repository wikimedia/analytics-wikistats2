import _ from '../lodash-custom-bundle';

class GraphModel {
    constructor (metricData, dimensionalData, prevBreakdowns) {
        this.metricData = metricData;
        this.dimensionalData = dimensionalData;
        if (prevBreakdowns) {
            this.breakdowns = prevBreakdowns;
        } else {
            this.breakdowns = JSON.parse(JSON.stringify(this.metricData.breakdowns));
        }
        // Remove dimension values that have no data.
        if (this.breakdowns) {
            this.breakdowns.forEach(breakdown => {
                let dimensionValues = this.dimensionalData.getDimensionValues(breakdown.breakdownName);
                breakdown.values = _.filter(breakdown.values, item => dimensionValues.includes(item.key));
            });
        }
    }
    getGraphData () {
        if (this.metricData.type === 'list') {
            return this.topXByY(this.metricData.key, this.metricData.value);
        }
        const xAxisValue = 'timestamp';
        const yAxisValue = this.metricData.value;
        this.dimensionalData.measure('timestamp');
        const activeBreakdown = this.getActiveBreakdown();
        if (activeBreakdown) {
            // TODO: individual breakdown values should be filtered with DimensionalData
            let brokenDownValues = [];
            const rawValues = this.dimensionalData.breakdown(yAxisValue, activeBreakdown.breakdownName);
            return rawValues.map((row) => {
                var ts = row.timestamp;
                const month = createDate(ts);
                return {month: month, total: row[yAxisValue]};
            });
        } else {
            const rawValues = this.dimensionalData.breakdown(yAxisValue);
            return rawValues.map((row) => {
                var ts = row.timestamp;
                const month = createDate(ts);
                return {month: month, total: row[yAxisValue]}
            });
        }
    }
    getMetricBreakdowns () {
        return this.metricData.breakdowns;
    }
    getBreakdowns () {
        return this.breakdowns;
    }
    getArea () {
        return this.metricData.area;
    }
    getDarkColor () {
        return this.metricData.darkColor;
    }
    getActiveBreakdown () {
        if (!this.breakdowns) return null;
        return this.breakdowns.filter((breakdown) => {
            return breakdown.on;
        })[0];
    }

    getAggregateLabel () {
        return this.metricData.additive ? 'Total' : 'Average';
    }

    getAggregate () {
        return this.getLimitedAggregate();
    }

    getLimitedAggregate (limitToLastN) {
        const values = this.getAggregatedValues(limitToLastN);
        const total = _.sum(values);
        const average = _.round(total / values.length, 1);

        return this.metricData.additive ? total : average;
    }

    getAggregatedValues (limitToLastN) {
        const data = this.getGraphData();
        let values;

        if (typeof data[0].total === 'number') {
            values = data.map((c) => {
                return c.total;
            });
        } else {
            values = data.map((r) => {
                return _.sum(_.map(r.total, (breakdownValue, key) => {
                    return this.getActiveBreakdown().values.find(v => v.key === key).on? breakdownValue: 0;
                }));
            });
        }
        const limit = Math.min(limitToLastN || values.length, values.length);
        return _.take(values, limit);
    }
    topXByY (x, y) {
        this.dimensionalData.measure(x);
        return _.sortBy(this.dimensionalData.breakdown(y), y).reverse();
    }
}

function createDate(timestamp) {
    if (timestamp.length <= 10) {
        return new Date(timestamp.slice(0,4) + '-'
                        + timestamp.slice(4,6) + '-'
                        + timestamp.slice(6,8));
    } else {
        return new Date(timestamp);
    }
}

export default GraphModel;

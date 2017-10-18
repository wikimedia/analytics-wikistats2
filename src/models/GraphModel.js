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
                const month = ts.slice(0,4) + '-'
                        + ts.slice(4,6) + '-'
                        + ts.slice(6,8);
                return {month: month, total: row[yAxisValue]};
            });
        } else {
            const rawValues = this.dimensionalData.breakdown(yAxisValue);
            return rawValues.map((row) => {
                var ts = row.timestamp;
                const month = ts.slice(0,4) + '-'
                        + ts.slice(4,6) + '-'
                        + ts.slice(6,8);
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
    getTotal () {
        return _.sum(this.getAggregatedValues());
    }
    getActiveBreakdown () {
        if (!this.breakdowns) return null;
        return this.breakdowns.filter((breakdown) => {
            return breakdown.on;
        })[0];
    }
    getAggregatedValues () {
        const data = this.getGraphData();
        if (typeof data[0].total === 'number') {
            return data.map((c) => {
                return c.total;
            });
        } else {
            return data.map((r) => {
                return _.sum(_.map(r.total, (breakdownValue, key) => {
                    return this.getActiveBreakdown().values.find(v => v.key === key).on? breakdownValue: 0;
                }));
            });
        }
    }
    topXByY (x, y) {
        this.dimensionalData.measure(x);
        return _.sortBy(this.dimensionalData.breakdown(y), y).reverse();
    }
}

export default GraphModel;

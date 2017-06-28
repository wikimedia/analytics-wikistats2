class GraphModel {
    constructor (metricData, dimensionalData) {
        this.metricData = metricData;
        this.dimensionalData = dimensionalData;
    }
    getGraphData () {
        const xAxisValue = 'timestamp';
        const yAxisValue = 'views';
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
                        + ts.slice(6,8)
                return {month: month, total: row.views}
            });
        } else {
            const rawValues = this.dimensionalData.breakdown(yAxisValue);
            return rawValues.map((row) => {
                var ts = row.timestamp;
                const month = ts.slice(0,4) + '-'
                        + ts.slice(4,6) + '-'
                        + ts.slice(6,8)
                return {month: month, total: row.views}
            });
        }
    }
    getBreakdowns () {
        return this.metricData.breakdowns;
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
        return this.metricData.breakdowns.filter((breakdown) => {
            return breakdown.on;
        })[0];
    }
    getAggregatedValues () {
        const data = this.getGraphData();
        if (typeof data[0].total === 'number') {
            return data.map((c) => {
                return c.total
            });
        } else {
            return data.map((r) => {
                return _.sum(_.map(r.total, (breakdownValue, key) => {
                    return this.getActiveBreakdown().values.find(v => v.key === key).on? breakdownValue: 0;
                }));
            });
        }
    }
}

export default GraphModel;
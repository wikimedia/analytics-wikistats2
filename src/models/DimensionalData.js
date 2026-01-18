import Crossfilter from 'crossfilter';
import _ from 'lodash';

class DimensionalData {
    constructor(values, measureColumn) {
        this.crossfilter = new Crossfilter(values || []);
        this.dimensionCache = {};

        if (measureColumn) {
            this.measure(measureColumn);
        }
    }

    getCrossfilter () {
        return this.crossfilter;
    }

    total (column) {
        let aggregate = column || this.currentMeasure;

        // TODO: is using this.dimension faster or better?
        return this.crossfilter.groupAll().reduceSum((row) => {
            return row[aggregate];
        }).value();
    }

    aggregate (baseDimension, measureName) {
        const baseGroup = Object.values(_.groupBy(this.getAllItems(), r => r[baseDimension]));
        // aggregate filtered values and generate a "total"
        const aggregatedValues = baseGroup.map(timeRow =>{
            const sum = timeRow.reduce((p,c) => {
                p += c[measureName];
                return p;
            }, 0);
            const sampleRow = timeRow[0]
            const baseDimensionValue = sampleRow[baseDimension];
            const resultRow = {};
            resultRow[baseDimension] = baseDimensionValue;
            resultRow[measureName] = {total: sum};
            return resultRow;
        });
        return aggregatedValues;
    }

    aggregateAndSplit (baseDimension, measureName, splittingDimensionKey) {
        // group by splitting dimension
        const baseGroup = Object.values(_.groupBy(this.getAllItems(), r => r[baseDimension]));
        const groupedByDimension = baseGroup.map(group => _.groupBy(group, r => r[splittingDimensionKey]));
        const aggregatedAndSplitValues = groupedByDimension.map(row => {
            let aggregatedValues = {};
            const formattedValues = Object.keys(row).forEach(rowKey => {
                aggregatedValues[rowKey] = row[rowKey].reduce((p, c) => p + c[measureName], 0);
            });
            const resultRow = {};
            resultRow[baseDimension] = Object.values(row)[0][0][baseDimension];
            resultRow[measureName] = aggregatedValues;
            return resultRow;
        });
        return aggregatedAndSplitValues;
    }

    filterSplit (dimensions, measureName, baseDimension = 'timestamp') {
        // In any timeseries graph the first dimension is time
        // In a tops metric, the metric config defines which value to group by
        // (like countries, page titles...)
        const baseGroup = Object.values(_.groupBy(this.getAllItems(), r => r[baseDimension]));
        // There should only be one splitting value, if any
        const splittingDimension = dimensions.find(d => d.splitting);
        const splittingDimensionKey = splittingDimension && splittingDimension.key;
        if (splittingDimensionKey) {
            return this.aggregateAndSplit(baseDimension, measureName, splittingDimensionKey);
        } else {
            return this.aggregate(baseDimension, measureName);
        }
    }

    addDimension (column) {
        if (!(column in this.dimensionCache)) {
            this.dimensionCache[column] = this.crossfilter.dimension((r) => r[column]);
        }
    }

    getDimensionValues (column) {
        let allItems = this.getAllItems();
        let dimensionValues = {};
        allItems.forEach(item => {
            dimensionValues[item[column]] = true;
        });
        return Object.keys(dimensionValues);
    }

    // NOTE: this is expensive to the point of falling into an infinite loop
    // when the dataset is large enough. Bug T312717 showed that daily data
    // for the cumulative pages metric is big enough to break crossfilter's sort
    // That shouldn't happen, but in any case, be careful when calling this function.
    // It's better to use isEmpty or similar logic when you just need
    // the count and not the actual items.
    getAllItems () {
        return this.crossfilter.dimension(
            item => item[this.currentMeasure]
        ).top(Infinity);
    }

    isEmpty () {
        return this.crossfilter.size() === 0;
    }

    measure (column) {
        this.addDimension(column);
        this.currentMeasure = column;
        this.dimension = this.dimensionCache[column];
    }

    unique (column) {
        this.addDimension(column);

        return this.dimensionCache[column].group().all().map((g) => g.key).sort();
    }

    merge (recordSet) {
        this.crossfilter.add(recordSet);
    }

    filter (column, value) {
        this.addDimension(column);

        return this.dimensionCache[column].filter(value);
    }

    clearFilters (column) {
        if (!(column in this.dimensionCache)) { return; }

        this.dimensionCache[column].filterAll();
    }

    clearAllFilters () {
        Object.keys(this.dimensionCache).forEach((d) => d.filterAll());
    }
}

export default DimensionalData

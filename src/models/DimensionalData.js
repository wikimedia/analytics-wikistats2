import Crossfilter from 'crossfilter';

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

    addDimension (column) {
        if (!(column in this.dimensionCache)) {
            this.dimensionCache[column] = this.crossfilter.dimension((r) => r[column]);
        }
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

    breakdown (column, secondColumn) {
        let measure = this.currentMeasure;
        this.addDimension(measure);
        if (!secondColumn) {
            const breakDownMap = this.dimensionCache[measure].group().reduceSum((row) => {
                return row[column];
            }).top(Infinity).reduce((p, c) => {
                p[c.key] = c.value;
                return p;
            }, {});
            return Object.keys(breakDownMap).map((key) => {
                let row = {}
                row[measure] = key;
                row[column] = breakDownMap[key];
                return row;
            });
        } else {
            const breakDownMap = this.dimensionCache[measure].group().reduce(
                (p,c) => {
                    p[c[secondColumn]] = p[c[secondColumn]]?
                        p[c[secondColumn]] + c[column]:
                        c[column];
                    return p;
                },
                () => {},
                () => {
                    return {};
                }
            ).top(Infinity).reduce((p, c) => {
                p[c.key] = c.value;
                return p;
            }, {});
            return Object.keys(breakDownMap).map((key) => {
                let row = {}
                row[measure] = key;
                row[column] = breakDownMap[key];
                return row;
            });
        }
    }

}

export default DimensionalData

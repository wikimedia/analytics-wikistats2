import * as format from 'd3-format'

function labeledCrossProduct (obj) {
    let explodedKeys = Object.keys(obj).map(k => obj[k].map(o => {
        let keyed = {};
        keyed[k] = o;
        return keyed;
    }));

    return explodedKeys.reduce((result, arr) => {
        return result
            .map(x => arr.map(y => Object.assign({}, x, y)))
            .reduce((a, b) => a.concat(b), []);
    }, [{}]);
};

function cloneDeep (c) {
    return JSON.parse(JSON.stringify(c));
}

function getLastFullMonth (yyyymmddDate) {
    if (yyyymmddDate.length < 6) { return { year: 2017, month: 11 }; }

    let year = parseInt(yyyymmddDate.slice(0, 4), 10);
    let month = parseInt(yyyymmddDate.slice(4, 6), 10);

    const lastFullDate = new Date(year, month - 1, -1);
    const lastMonth = '' + (lastFullDate.getMonth() + 1);

    return {
        year: '' + lastFullDate.getFullYear(),
        month: (lastMonth.length === 1 ? '0' : '') + lastMonth,
    };
}

export default {
    labeledCrossProduct,
    cloneDeep,
    getLastFullMonth,
};

import dateFormat from 'dateformat';
import config from './config';
import TimeRange from 'Src/models/TimeRange';

const dimensionsKeyExplode = (dimensions) => {
    let explodedKeys = dimensions.map(dimension => {
        const allValuesActive = !dimension.values.some(value => !value.on);
        const lockedDimension = dimension.locked;
        const useAllValue = !lockedDimension && !dimension.active || (!dimension.splitting && allValuesActive);
        if (useAllValue) {
            let keyed = {};
            keyed[dimension.key] = dimension.allValue;
            return [keyed];
        }
        return dimension.values
            .filter(value => value.on)
            .map(value => {
                let keyed = {};
                keyed[dimension.key] = value.key;
                return keyed;
            });
    });
    return explodedKeys.reduce((result, arr) => {
        return result
            .map(x => arr.map(y => Object.assign({}, x, y)))
            .reduce((a, b) => a.concat(b), []);
    }, [{}]);
}

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

function getLastFullMonth (date) {
    const lastFullDate = new Date(new Date(date).setMonth(new Date(date).getUTCMonth() - 1));
    const lastMonth = '' + (lastFullDate.getUTCMonth() + 1);

    return {
        year: '' + lastFullDate.getUTCFullYear(),
        month: (lastMonth.length === 1 ? '0' : '') + lastMonth,
    };
}

function createDate(timestamp) {
    let date;
    if (timestamp.length <= 10) {
        date = new Date(timestamp.slice(0,4) + '-'
                        + timestamp.slice(4,6) + '-'
                        + timestamp.slice(6,8));
    } else {
       date =  new Date(timestamp);
    }

    // returns a timestamp, not a date object
    date = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

    let tmp = new Date();
    // SetTime takes an integer represented
    // by a number of milliseconds since January 1, 1970, 00:00:00 UTC.
    // when you print this date to see its true UTC value you need to use .toUTCString
    tmp.setTime(date);
    return tmp;
}

// returns current time in UTC
function createNowUTCDate(){
    let date = new Date();

    // returns a timestamp, not a date object
    date = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    let tmp = new Date();
    tmp.setTime(date);
    return tmp;
}

/**
* Returns a timestamp
**/
function getUTCTimestampFromYearMonth(year, month){
    //months start at zero
    return Date.UTC(year, month - 1, 1, 0, 0, 0);
}

function getGranularity (timeRange) {
    if (timeRange.timeKeyword) {
        return ['1-Month', '3-Month'].includes(timeRange.timeKeyword) ? 'daily' : 'monthly';
    } else {
        const millisecondsInSixMonths = 15552e6;
        return timeRange.end - timeRange.start > millisecondsInSixMonths ? 'monthly' : 'daily';
    }
}

function getDefaultTimeRange (metricConfig) {
    const structure = metricConfig.structure;
    if (structure === 'top') {
        return new TimeRange('last-month');
    } else {
        return new TimeRange('2-year');
    }
}

function getDateFormatFromData (data) {
    if (!(data && data.length && data[0].month)) { return 'yyyy-mm'; }
    return getGranularity(data[0].month, data[data.length - 1].month) === 'monthly' ?
        'yyyy-mm' : 'yyyy-mm-dd';
}

function adjustGraphData (graphData, timeRangeName) {
    if (!timeRangeName || timeRangeName === 'All') { return graphData; }
    const maxElements = {
        '2-year': 24, '1-year': 12, '3-month': 92, '1-month': 31
    }[timeRangeName.toLowerCase()];

    return graphData.slice(Math.max(graphData.length - maxElements, 0));
}

function isProjectFamily (project) {
    return project.match(/all-wik[a-z]+-projects/);
}

function dateFormatForGranularity (date, granularity) {
    if (granularity === 'monthly') {
        return dateFormat(date, "mmm yyyy", true);
    } else if (granularity === 'daily') {
        return dateFormat(date, "d mmm yyyy", true);
    }
}

export default {
    dimensionsKeyExplode,
    labeledCrossProduct,
    cloneDeep,
    getLastFullMonth,
    createDate,
    getUTCTimestampFromYearMonth,
    createNowUTCDate,
    getGranularity,
    getDefaultTimeRange,
    getDateFormatFromData,
    adjustGraphData,
    isProjectFamily,
    dateFormatForGranularity
};

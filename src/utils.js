import dateFormat from 'dateformat';
import config from './config';

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

    const lastFullDate = new Date(getUTCTimestampFromYearMonth(year, month - 1));
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
    if (timeRange.name) {
        return ['1-Month', '3-Month'].includes(timeRange.name) ? 'daily' : 'monthly';
    } else {
        const millisecondsInSixMonths = 15552e6;
        return timeRange.end - timeRange.start > millisecondsInSixMonths ? 'monthly' : 'daily';
    }
}

function getDefaultTimeRange (metricConfig) {
    return {name: metricConfig.legacy ? 'All' : '2-Year'};
}

function getRequestInterval (timeRange) {
    const format = 'yyyymmdd00';
    var startDate, endDate;

    if (timeRange.name) {
        endDate = createNowUTCDate();
        if (timeRange.name === 'All') {
            startDate = config.startDate;
        } else {
            const monthsAgo = ['2-Year', '1-Year'].includes(timeRange.name) ? 28 : 7;
            startDate = new Date(endDate);
            startDate.setUTCMonth(endDate.getUTCMonth() - monthsAgo);
        }
    } else {
        startDate = timeRange.start;
        endDate = timeRange.end;
    }

    return {
        start: dateFormat(startDate, format, true),
        end: dateFormat(endDate, format, true)
    };
}

function getDateFormatFromData (data) {
    if (!(data && data.length && data[0].month)) { return 'yyyy-mm'; }
    return getGranularity(data[0].month, data[data.length - 1].month) === 'monthly' ?
        'yyyy-mm' : 'yyyy-mm-dd';
}

function adjustGraphData (graphData, timeRangeName) {
    if (!timeRangeName || timeRangeName === 'All') { return graphData; }
    const maxElements = {'2-Year': 24, '1-Year': 12, '3-Month': 92, '1-Month': 31};
    return graphData.slice(Math.max(graphData.length - maxElements[timeRangeName], 0));
}

export default {
    labeledCrossProduct,
    cloneDeep,
    getLastFullMonth,
    createDate,
    getUTCTimestampFromYearMonth,
    createNowUTCDate,
    getGranularity,
    getDefaultTimeRange,
    getRequestInterval,
    getDateFormatFromData,
    adjustGraphData
};

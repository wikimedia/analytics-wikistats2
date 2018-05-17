
import dateformat from 'dateformat';


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
    return Date.UTC(year, month-1, 1,0, 0,0);
}

/**
* Time range we would use to fetch data
**/
function getDefaultTimeRange() {
    const end = createNowUTCDate();
    const start = createNowUTCDate();
    start.setUTCFullYear(end.getUTCFullYear() - 2);

    // substract 1 from current month as wikistats data is
    // one month  (or more) delayed from current month
    let startMonth = start.getUTCMonth();
    let startYear = start.getUTCFullYear();
    if (startMonth > 0) {
        startMonth = startMonth-1;
    } else {
        startMonth = 12;
        startYear = startYear -1;
    }
    start.setUTCMonth(startMonth);
    start.setUTCFullYear(startYear);
    start.setUTCDate(1);

    return {
        name: '2-Year',
        start: dateformat(start, 'yyyymmdd00', true),
        end: dateformat(end, 'yyyymmdd00', true ),
    };
}

export default {
    labeledCrossProduct,
    cloneDeep,
    getLastFullMonth,
    createDate,
    getUTCTimestampFromYearMonth,
    createNowUTCDate,
    getDefaultTimeRange
};

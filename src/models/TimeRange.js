import dateFormat from 'dateformat';

class TimeRange {
    constructor(range) {
        if (range.constructor === TimeRange) {
            this.timeKeyword = range.timeKeyword;
            this.start = range.start;
            this.end = range.end;
        } else if (typeof range === 'string') {
            this.timeKeyword = range;
            range = TimeRange.relativeToAbsolute(this.timeKeyword);
            this.start = range.start;
            this.end = range.end;
        } else if (range.constructor === Array) {
            this.start = TimeRange.createDate(range[0]);
            this.end = TimeRange.createDate(range[1]);
        } else {
            this.start = TimeRange.createDate(range.start);
            this.end = TimeRange.createDate(range.end);
        }
    }

    // This method is only useful for top metrics on daily granularity;
    getPaddedDay () {
        const day = this.getMidDate().getUTCDate();
        return ('0' + day).slice(-2);
    }

    getPaddedMonth () {
        const month = this.getMidDate().getUTCMonth() + 1;
        return ('0' + month).slice(-2);
    }

    getYear () {
        return this.getMidDate().getUTCFullYear();
    }

    getRangeForURL () {
        const format = TimeRange.formatDateForURL;
        return [format(this.start), format(this.end)];
    }

    getFormattedTimeRange (granularity, structure) {
        const start = TimeRange.dateFormatForGranularity(this.start, granularity);
        const end = TimeRange.dateFormatForGranularity(this.end, granularity);
        if (structure === 'top') {
            return end;
        } else {
            return start + ' - ' + end;
        }
    }

    getMidDate () {
        return new Date((this.end.getTime() + this.start.getTime()) / 2);
    }

    isOutOfMetricBounds (metricConfig) {
        return this.start < new Date(metricConfig.knownStart) || this.end > new Date(metricConfig.knownEnd);
    }

    adjustToGranularity (granularity) {
        if (granularity === 'monthly') {
            const newStart = new Date(this.start);
            newStart.setUTCDate(1);
            const newEnd = new Date(this.end);
            newEnd.setUTCDate(1);
            newEnd.setUTCMonth(newEnd.getUTCMonth() + 1);
            newEnd.setUTCDate(newEnd.getUTCDate() - 1);
            this.start = newStart;
            this.end = new Date(Math.min(new Date(), newEnd));
        }
    }

    goBackOneMonth () {
        this.start.setMonth(this.start.getUTCMonth() - 1);
        this.end.setMonth(this.end.getUTCMonth() - 1);
    }

    static formatDateForURL (date) {
        const format = 'yyyymmdd00';
        return dateFormat(date, format, true);
    }

    static relativeToAbsolute (timeKeyword) {
        const lastAvailable = new Date();
        lastAvailable.setUTCDate(1);
        lastAvailable.setUTCHours(-1);
        let startDate = new Date(lastAvailable);
        startDate.setUTCDate(1);
        startDate.setUTCHours(1);
        if (timeKeyword === '2-year') {
            startDate.setUTCMonth(lastAvailable.getUTCMonth() - 24);
        } else if (timeKeyword === '1-year') {
            startDate.setUTCMonth(lastAvailable.getUTCMonth() - 12);
        } else if (timeKeyword === '1-month') {
            startDate.setUTCMonth(lastAvailable.getUTCMonth() - 1);
        } else if (timeKeyword === '3-month') {
            startDate.setUTCMonth(lastAvailable.getUTCMonth() - 3);
        } else if (timeKeyword === 'last-month') {
            startDate.setUTCDate(1);
        } else if (timeKeyword === 'all') {
            startDate = TimeRange.createDate('2001-01-01');
        } else throw("Invalid time range");
        return {
            start: TimeRange.createDate(startDate),
            end: TimeRange.createDate(lastAvailable)
        }
    }

    static createDate(timestamp) {
        let date;
        if (timestamp.indexOf && timestamp.indexOf('-') > -1) {
            date = new Date(timestamp);
        } else if (timestamp.length <= 10) {
            date = new Date(timestamp.slice(0,4) + '-'
                            + timestamp.slice(4,6) + '-'
                            + timestamp.slice(6,8));
        } else {
            date = new Date(timestamp);
            date = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        }

        // returns a timestamp, not a date object

        let tmp = new Date();
        // SetTime takes an integer represented
        // by a number of milliseconds since January 1, 1970, 00:00:00 UTC.
        // when you print this date to see its true UTC value you need to use .toUTCString
        tmp.setTime(date);
        return tmp;
    }

    static getDefaultTimeRange (metricConfig) {
        const structure = metricConfig.structure;
        if (metricConfig.knownEnd) {
            return TimeRange.getAllTimeRange(metricConfig);
        }
        if (structure === 'top') {
            return new TimeRange('last-month');
        } else {
            return new TimeRange('2-year');
        }
    }

    /*
    "All" time ranges depend on the extent of the metric. All editing metrics
    have 2001-now as their range, but most reading metrics have different availabilities,
    as described in the metric config's knownStart and knownEnd properties.

    This function creates the time range based on those properties.
    */
    static getAllTimeRange (metricConfig) {
        const timeRange = new TimeRange('all');
        const start = metricConfig.knownStart || '2001-01-01';
        const end = metricConfig.knownEnd || new Date();
        timeRange.start = TimeRange.createDate(start);
        timeRange.end = TimeRange.createDate(end);
        return timeRange;
    }

    static dateFormatForGranularity (date, granularity) {
        if (granularity === 'monthly') {
            return dateFormat(date, "mmm yyyy", true);
        } else if (granularity === 'daily') {
            return dateFormat(date, "d mmm yyyy", true);
        }
    }
}

export default TimeRange;
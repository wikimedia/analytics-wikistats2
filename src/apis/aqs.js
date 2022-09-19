/**
 * Retrieves pageview and unique devices counts from AQS.
 */
import DimensionalData from '../models/DimensionalData';
import config from '../config';
import _ from '../lodash-custom-bundle';
import utils from '../utils';
import dateFormat from 'dateformat';


class AQS {
    constructor () {}

    /*
     * Returns {DimensionalData}
     *  An instance of a DimensionalData object with all the results from all the calls
     *
     * Parameters
     *  uniqueParameters    : {Object} Keys are names of parameters for the AQS call
     *                        Values are arrays of values that need to be exploded into
     *                        separate calls.
     *                        REQUIRED: project array
     *  commonParameters    : {Object} Keys are names of parameters for the AQS call
     *                        Values are single values that are to be passed with each call.
     *                        REQUIRED: metric, and any required common parameters
     *
     * Example
     *  uniqueParameters = {
     *      project: ['en.wikipedia', 'fr.wiktionary'],
     *      access_method: ['desktop', 'mobile-web']
     *  }
     *  commonParameters = {
     *      metric: 'pageviews-aggregate', agent: 'user',
     *      granularity: 'daily', start: '20170514', end: '20170614'
     *  }
     *
     *  will result in the following AQS calls (spaces added for clarity):
     *
     *  /pageviews/aggregate/en.wikipedia  /desktop    /user/daily/20170514/20170614
     *  /pageviews/aggregate/en.wikipedia  /mobile-web /user/daily/20170514/20170614
     *  /pageviews/aggregate/fr.wiktionary /desktop    /user/daily/20170514/20170614
     *  /pageviews/aggregate/fr.wiktionary /mobile-web /user/daily/20170514/20170614
     */
    getData (uniqueParameters, commonParameters, dimensions) {
        let tries = 3;
        return new Promise((resolve, reject) => {
            const attemptGettingData = () => {
                const uncheckedPromise = this.requestData(
                    uniqueParameters,
                    commonParameters,
                    dimensions
                );
                uncheckedPromise.then(dimensionalData => {
                    /*
                    If this is a top metric, we'll attempt several times to get data,
                    going back one month at a time, up to the number of attempts
                    defined in `tries`.
                    */
                    if (
                        config.metrics[commonParameters.metric].structure === "top" &&
                        dimensionalData.isEmpty() &&
                        tries--
                    ) {
                        commonParameters.timeRange.goBackOneMonth();
                        attemptGettingData();
                    } else resolve(dimensionalData); // The promise is now checked 🍻
                });
                uncheckedPromise.catch(reject);
            };
            attemptGettingData();
        });
    }

    requestData (uniqueParameters, commonParameters, dimensions) {
        if (!commonParameters.metric) {
            return new Promise(() => new DimensionalData());
        }
        const timeRange = commonParameters.timeRange;
        [commonParameters.start, commonParameters.end] = timeRange.getRangeForURL();
        commonParameters.year = timeRange.getYear();
        commonParameters.month = timeRange.getPaddedMonth();
        commonParameters.day = commonParameters.granularity === 'daily' ? timeRange.getPaddedDay() : 'all-days';
        const apiConfig = config.aqs[commonParameters.metric];
        const metricConfig = config.metrics[commonParameters.metric];
        if (metricConfig.cumulative === true) {
            // Cumulative metrics are more expensive.  We have to fetch all history
            // so we can keep a tally from the start until the day requested by the user.
            commonParameters.start = '1980010100';
        }

        let promises = utils.dimensionsKeyExplode(dimensions)
            .map(p => Object.assign(p, commonParameters))
            .map(p => {
                p.referer = uniqueParameters.referer && uniqueParameters.referer[0];
                p.project = uniqueParameters.project && uniqueParameters.project[0];
                if (p.referer) {
                    // hack for mediarequests
                    p.referer = p.project.replace('all-projects', 'all-referers');
                    p.project = p.referer;
                }
                for (let up in uniqueParameters) {
                    if (!p[up]) {
                        p[up] = uniqueParameters[up];
                    }
                }
                let url = apiConfig.endpoint;
                (url.match(/{{.*?}}/g) || []).forEach((k) => {
                    const key = _.trim(k, '{}');
                    url = url.replace(k, p[key]);
                });

                // console.info('getting ', url.replace(/https.*metrics\//, ''));
                return new Promise((resolve, reject) => {
                    $.get({
                        url: url,
                        success: resolve,
                        // Some wikis may return 200 for some requests and 404 for others.
                        // Like: 200 for desktop and mobile-web, and 404 for mobile-app.
                        // This resolves the 404 errors so that Promise.all() can handle them.
                        error: (xhr, status, error) => { resolve({xhr, status, error}); },
                        crossDomain: true
                    });
                });
            });
        return Promise.all(promises).then(data => {
            let validData = _.filter(data, d => !d.hasOwnProperty('error'));
            let formattedData = _.flatten(validData.map(d => d.items));
            if (formattedData.length > 0) {
                // Some endpoints return repetitive information in an upper level, and then row
                // data in a results array
                if (formattedData[0].results) {
                    formattedData = this.transformResults(formattedData);
                }
                if (metricConfig.structure === 'top') {
                    formattedData = this.formatTops(formattedData, metricConfig.arrayName);
                }
                return new DimensionalData(formattedData);
            } else {
                return new DimensionalData([]);
            }
        });
    }

    /*
    INPUT:
    {project: "es.wikipedia", access: "all-access", year: "2018", month: "02", countries: Array(223)}

    OUTPUT:
        Array with 223 items:
    [
        {country: "MX", views: "100000000-999999999", rank: 1, timestamp: 1517443200000}
        {country: "ES", views: "100000000-999999999", rank: 2, timestamp: 1517443200000}
        {country: "CO", views: "100000000-999999999", rank: 3, timestamp: 1517443200000}
        {country: "AR", views: "10000000-99999999",   rank: 4, timestamp: 1517443200000}
    ]
    */
    formatTops (data, column) {
        let timestamp;
        if (data.length === 0) return [];
        // Some metrics carry a timestamp, others a year and month.
        if (data[0].timestamp) {
            timestamp = utils.createDate(data[0].timestamp);
        } else {
            timestamp = utils.getUTCTimestampFromYearMonth(data[0].year, data[0].month);
        }

        const flatData = _.flatten(data.map(item => item[column]));

        return flatData.map(item => Object.defineProperty(item, 'timestamp', {value: timestamp, writable:false} ))
    }


    /*
    Takes the common data in an API request and adds it to each individual item.

    INPUT:                                               OUTPUT:
    {                                                    [
        'granularity': 'monthy',                             {
        'access-site': 'desktop-site',                           'granularity': 'monthy',
        'results': [                            ==>              'access-site': 'desktop-site',
            {                                                    'timestamp': '2017090100',
                'timestamp': '2017090100',                       'value': 200
                'value': 200                                 }, ...
            }, ...
        ]
    }

    Any hyphens in keys will be replaced by underscores to uniformize dimension keys
    and parameter names.
    */
    transformResults (data) {
        return data.reduce((p, c) => {
            let keys = Object.keys(c);
            const resultsIndex = keys.indexOf('results');
            keys.splice(resultsIndex, 1);
            return p.concat(c.results.map((datum) => {
                keys.forEach((key) => {
                    datum[key.replace(/-/g, '_')] = c[key];
                })
                return datum
            }))
        }, []);
    }
}

export default AQS;

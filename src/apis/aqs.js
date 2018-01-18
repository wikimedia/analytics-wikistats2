/**
 * Retrieves pageview and unique devices counts from AQS.
 */
import DimensionalData from '../models/DimensionalData';
import config from '../config';
import _ from '../lodash-custom-bundle';
import utils from '../utils';


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
     *      metric: 'pageviews-aggregate', agent_type: 'user',
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
    getData (uniqueParameters, commonParameters) {
        if (!commonParameters.metric) {
            return new Promise(() => new DimensionalData());
        }

        let apiConfig = config.aqs[commonParameters.metric];
        const metricConfig = config.metrics[commonParameters.metric];
        let promises = utils.labeledCrossProduct(uniqueParameters)
            .map(p => Object.assign(p, commonParameters))
            .map(p => {
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
                throw 'None of the API requests have returned any data.';
            }
        });
    }

    formatTops (data, column) {
        return _.flatten(data.map(item => item[column]));
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

    Any hyphens in keys will be replaced by underscores to uniformise breakdown keys
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
/*

AQS only has data up to the previous month to the current, so when requesting
the last data available we should check that we're not trying to get
the current month (or later).

*/

export default AQS;

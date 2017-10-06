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
        let promises = utils.labeledCrossProduct(uniqueParameters)
            .map(p => Object.assign(p, commonParameters))
            .map(p => {
                let url = apiConfig.endpoint;
                url.match(/{{.*?}}/g)
                    .forEach((k) => {
                        const key = _.trim(k, '{}');
                        url = url.replace(k, p[key]);
                    });
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
                return new DimensionalData(formattedData);
            } else {
                throw 'None of the API requests have returned any data.';
            }
        });
    }
}

export default AQS;

/**
 * Retrieves pageview and unique devices counts from AQS.
 */
import pageviews from 'exports-loader?pageviews!pageviews';
import DimensionalData from '../models/DimensionalData';
import config from '../config';
import _ from 'lodash';
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

        let apiConfig = config.aqs[commonParameters.metric];
        let promises = utils.labeledCrossProduct(uniqueParameters)
            .map(p => Object.assign(p, commonParameters))
            // TODO: looking at what the pageviews module actually does, I don't think
            // we should use it, it's a convenience that we don't need and we end up running
            // through a bunch of unnecessary code
            .map(p => pageviews[apiConfig.method](p));

        return Promise.all(promises)
            .then(data => _.flatten(data.map(d => d.items)))
            .then(items => new DimensionalData(items));
    }
}

export default AQS;

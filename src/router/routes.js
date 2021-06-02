import _ from '../lodash-custom-bundle';
import config from '../config';
import utils from '../utils';
import detailURL from './urls/detail';
import UserPreferences from './UserPreferences';
import Dimension from 'Src/models/Dimension';

/**
 * Specify routes and their properties here.
 *
 * Routes can have named wildcards (i.e. :project).
 * When a path matches a route, the value corresponding
 * to a wildcard will be automatically assigned to
 * a property in the application's state.
 *
 * Regular routes need to specify the name of the main
 * component that will be inserted in App.vue.
 *
 * Redirect routes will transparently redirect the app
 * without polluting the browser history. You can specify
 * a redirect path (string) or a redirect function.
 *
 * Note: Given the way the router works, there can not
 * be 2 routes with the same set of wildcards.
 */
const routes = [
    ['/', { redirect: '/' + config.ALL_PROJECTS }],
    ['/:projects', { mainComponent: 'dashboard' }],
    ['/:section/:projects', {matchIf: (s) => s.section === 'metrics', mainComponent: 'metrics-matrix'}],
    ['/:projects/:area', { redirect: getDefaultMetricPath }],
    ['/:projects/:area/:metric', { redirect: getDefaultMetricPath }],
    ['/:projects/:area/:metric/:detail', { mainComponent: 'detail' }],
];

const userPreferences = new UserPreferences();

/**
 * Specify the redirect functions here.
 *
 * Redirect functions should receive a single parameter
 * of type object with the key-value pairs deduced from
 * matching the route with the original path. For example:
 * Matching the route /:foo/:bar with the path /hello/world
 * will call the redirect function with the parameter:
 * {foo: 'hello', bar: 'world'}.
 *
 * Redirect funtions should return the path (string) that
 * the app should be redirected to.
 */
function getDefaultMetricPath (params) {
    // Returns the path to the default metric of a given area.
    let metric = params.metric;
    if (!metric) {
        let area = _.find(config.areaData(), (item) => item.state.id === params.area);
        metric = area.state.metrics[0];
    }
    const detail = getMergedDetail(metric);
    return ['', params.projects[0], params.area, metric, detailURL.writeToURL(detail)].join('/');
}

function getMergedDetail (metric) {
    // Merges the metric default configuration with user preferences.
    const metricConfig = config.metricConfig(metric);
    const defaults = {
        chartType: config.getChartTypes(metricConfig)[0].chart,
        timeRange: utils.getDefaultTimeRange(metricConfig),
        fullscreen: false,
        dimensions: Dimension.fromMetricConfig(metricConfig),
        breakdown: {values: [{key: 'total', on: true}]},
        granularity: 'monthly'
    };

    let breakdown;
    if (metricConfig.breakdowns) {
        for (let i = 0; !breakdown && i < metricConfig.breakdowns.length; i++) {
            const b = metricConfig.breakdowns[i];
            breakdown = userPreferences.get(['breakdown', b.key]);
        }
    }
    const preferences = {
        chartType: userPreferences.get(['chartType', metricConfig.type]),
        timeRange: userPreferences.get(['timeRange', metricConfig.structure]),
        fullscreen: userPreferences.get(['fullscreen']),
        dimensions: userPreferences.get(['dimensions']),
        breakdown,
    };

    Object.keys(preferences).filter(k => !(preferences[k])).forEach(k => delete preferences[k]);

    return Object.assign(defaults, preferences);
}

export {
    routes,
    userPreferences,
};

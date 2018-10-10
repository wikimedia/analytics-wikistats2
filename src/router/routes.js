import _ from '../lodash-custom-bundle';
import config from '../config';
import utils from '../utils';
import detailURL from './urls/detail';

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
    ['/:project', { mainComponent: 'dashboard' }],
    ['/:project/:area', { redirect: getDefaultMetricPath }],
    ['/:project/:area/:metric', { redirect: getDefaultMetricPath }],
    ['/:project/:area/:metric/:detail', { mainComponent: 'detail' }],
];

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
    return ['', params.project, params.area, metric, detailURL.writeToURL(detail)].join('/');
}

function getMergedDetail (metric) {
    // Merges the metric default configuration with user preferences.
    const metricConfig = config.metricConfig(metric);

    const defaults = {
        chartType: config.getChartTypes(metricConfig)[0].chart,
        timeRange: utils.getDefaultTimeRange(metricConfig),
        fullscreen: false,
        breakdown: {values: [{key: 'total', on: true}]},
    };

    let breakdown;
    if (metricConfig.breakdowns) {
        for (let i = 0; !breakdown && i < metricConfig.breakdowns.length; i++) {
            const b = metricConfig.breakdowns[i];
            breakdown = getUserPreference(['breakdown', b.breakdownName]);
        }
    }
    const preferences = {
        chartType: getUserPreference(['chartType', metricConfig.type]),
        timeRange: getUserPreference(['timeRange', metricConfig.frozen]),
        fullscreen: getUserPreference(['fullscreen']),
        breakdown,
    };

    Object.keys(preferences).filter(k => !(preferences[k])).forEach(k => delete preferences[k]);

    return Object.assign(defaults, preferences);
}

/**
 * Specify user preference updates here.
 *
 * updateUserPreferences is going to be called with each push
 * to the browser history, and will receive the state that is
 * being pushed. This way, the user preferences can be registered
 * in the userPreferences object.
 */
const userPreferences = {};
const getUserPreference = p => p.reduce((r, i) => (r && r[i]) ? r[i] : null, userPreferences);

const setUserPreference = (p, v) => {
    const l = p.length - 1;
    p.slice(0, l).reduce((r, i) => r[i] ? r[i] : r[i] = {}, userPreferences)[p[l]] = v;
};
const delUserPreference = p => {
    const l = p.length - 1;
    delete (p.slice(0, l).reduce((r, i) => r[i] ? r[i] : r[i] = {}, userPreferences)[p[l]]);
};

function updateUserPreferences (state) {
    if (state.detail) {
        const detail = detailURL.readFromURL(state.detail);
        const metricConfig = config.metricConfig(state.metric);
        const defaultChartType = config.getChartTypes(metricConfig)[0].chart;
        const chartTypeWasAChoice = (
            detail.chartType !== defaultChartType ||
            getUserPreference(['chartType', metricConfig.type])
        );
        if (chartTypeWasAChoice) {
            setUserPreference(['chartType', metricConfig.type], detail.chartType);
        }
        setUserPreference(['timeRange', metricConfig.frozen], detail.timeRange);
        if (!detail.breakdown.breakdownName && metricConfig.breakdowns) {
            metricConfig.breakdowns.forEach((b) => {
                delUserPreference(['breakdown', b.breakdownName]);
            });
        } else {
            setUserPreference(['breakdown', detail.breakdown.breakdownName], detail.breakdown);
        }
        setUserPreference(['fullscreen'], detail.fullscreen);
    }



}

export default {
    routes,
    updateUserPreferences,
};

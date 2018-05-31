import _ from '../lodash-custom-bundle';
import config from '../config';

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
    ['/:project/:area/:metric', { mainComponent: 'detail' }],
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
    let area = _.find(config.areaData(), (item) => item.state.id === params.area);
    return ['', params.project, params.area, area.state.metrics[0]].join('/');
}

export default routes;

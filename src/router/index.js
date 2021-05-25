import _ from '../lodash-custom-bundle';
import {userPreferences} from './routes';
import config from '../config';


// caches to memoize functions
let stateFromPathCache = {};

let matchStateCache = {};

let pathFromStateCache = {};

/**
 * Tries to match the given path with the given route.
 *
 * If they match, returns an object with the parameters
 * resulting from the match. For example:
 * Matching the route /:foo/:bar with the path /hello/world
 * will return: {foo: 'hello', bar: 'world'}.
 *
 * If they do not match, returns undefined.
 * It also checks that matchIf function, if present,
 * evaluates to true.
 */
function matchPath (route, info, path) {
    let [routeParts, pathParts] = [route.split('/'), path.split('/')];
    if (routeParts.length !== pathParts.length) {
        return;
    };
    let params = {};
    for (let [routePart, pathPart] of _.zip(routeParts, pathParts)) {
        if (routePart.startsWith(':') && pathPart !== '') {
            // preparing the ground for multiple metrics and wikis to be selected
            const values = pathPart.split(',');
            params[routePart.slice(1)] = values[0]
        } else if (routePart !== pathPart) {
            return;
        }
    }

    if (typeof info.matchIf === 'function' && !info.matchIf(params)) {
        return;
    }

    return params;
}

/**
 * Returns the state derived from a given path.
 *
 * Iterates over all specified routes and uses matchPath to
 * determine which route should be used. It applies redirects
 * if necessary. Finally returns the parameters inferred from
 * the match in the form of a application state.
 */
function getStateFromPath (path, routes) {
    if (path in stateFromPathCache) {

        return stateFromPathCache[path];
    }
    for (let [route, info] of routes) {
        let state = matchPath(route, info, path);
        if (state) {
            if (typeof info.redirect === 'string') {
                return getStateFromPath(info.redirect, routes);
            } else if (typeof info.redirect === 'function') {
                return getStateFromPath(info.redirect(state), routes);
            } else {
                // don't allow invalid area/metric combinations
                // assume the metric is right and use config
                if (state.area && state.metric) {
                    state.area = config.metricConfig(state.metric).area;
                }
                stateFromPathCache[path] = state;
                break;
            }
        }

    }

    if (!(path in stateFromPathCache)){
        stateFromPathCache[path] = {};
    }
    return stateFromPathCache[path];
}



/**
 * Tries to match the given state with the given route.
 *
 * Returns true if the route contains wildcards for all
 * the properties in the state object, and only those.
 * Returns false otherwise.
 * It also checks that matchIf function, if present,
 * evaluates to true.
 */
function matchState (route, info, state) {
    let cacheKey = [route, info, JSON.stringify(state)];
    if (cacheKey in matchStateCache) {
        return matchStateCache[cacheKey];
    }

    let match = true;
    let routeKeys = _.filter(route.split('/'), (part) => part.startsWith(':'));
    let stateKeys = _.filter(Object.keys(state), (key) => state[key] !== '');
    if (routeKeys.length !== stateKeys.length) {
        match = false;
    } else {
        for (let routeKey of routeKeys) {
            if (!stateKeys.includes(routeKey.slice(1))) {
                match = false;
                break;
            }
        }
    }

    if (match && typeof info.matchIf === 'function') {
        match = info.matchIf(state);
    }

    matchStateCache[cacheKey] = match;

    return match;
}

/**
 * Redirects the given state if necessary.
 *
 * If the state matches with a redirect route, the new redirected
 * state is returned. If it does not match with any redirect route,
 * undefined is returned.
 */
function getRedirectedState (state, routes) {
    for (let [route, info] of routes) {
        if (matchState(route, info, state)) {
            if (typeof info.redirect === 'string') {
                return getStateFromPath(info.redirect, routes);
            } else if (typeof info.redirect === 'function') {
                return getStateFromPath(info.redirect(state), routes);
            }
        }
    }
}

/**
 * Returns the main component that corresponds to a given state.
 *
 * This function assumes the passed state does not match
 * with any redirect routes.
 */
function getMainComponentFromState (state, routes) {
    for (let [route, info] of routes) {
        if (matchState(route, info, state)) {
            if (typeof info.mainComponent === 'function') {
                return info.mainComponent(state);
            } else {
                return info.mainComponent;
            }
        }
    }
}

/**
 * Returns the path that corresponds to a given state.
 *
 * The root is what should come before # in the absolute path.
 * This function assumes the passed state does not match
 * with any redirect routes.
 */
function getPathFromState (root, state, routes) {
    var cacheKey = JSON.stringify(state);

    if (cacheKey in pathFromStateCache){
        return pathFromStateCache[cacheKey];
    }

    for (let [route, info] of routes) {
        if (matchState(route, info, state)) {
            let path = route;
            for (let key of Object.keys(state)) {
                path = path.replace(':' + key, state[key]);
            }
            pathFromStateCache[cacheKey] = `${root}#${path}`;
            return pathFromStateCache[cacheKey];
        }
    }

    //return root domain but do not cache what can be "fake states"
    return root;


}

function flushCaches () {
    stateFromPathCache = {};
    matchStateCache = {};
    pathFromStateCache = {};
}


/**
 * Main Router class to be exported.
 *
 * The constructor receives the application store as a parameter.
 * When constructed, it initializes the application store's state
 * and the browser's location. And subscribes to changes on both
 * ends to update each other.
 *
 * It also receives an optional window object for testing purposes.
 */
class Router {
    constructor (store, routes, windowObject) {
        if (!windowObject) { windowObject = window; }

        // Initialize application state.
        let root = windowObject.location.pathname;
        let path = windowObject.location.hash.replace('#', '') || '/';
        path = path.replace('www.', '');
        let state = getStateFromPath(path, routes);
        windowObject.history.replaceState(state, '', getPathFromState(root, state, routes));
        userPreferences.update(state);
        let mainComponent = getMainComponentFromState(state, routes);
        store.commit('reload', Object.assign({mainComponent}, state));

        // Subscribe to changes on the application state.
        store.watch(
            () => {
                return store.getters.stateForURL
            },
            (stateForURL) => {
                stateForURL = _.pickBy(stateForURL, (property) => property !== '');
                let redirectedState = getRedirectedState(stateForURL, routes);
                if (redirectedState) {
                    // Update the application state with the redirect
                    // without propagating the change to browser history
                    // or updating the main component.
                    store.commit('reload', redirectedState);
                } else {
                    // Update only the main component and the browser's location.
                    store.commit('navigate', {
                        component: getMainComponentFromState(stateForURL, routes)
                    });
                    if (!_.isEqual(windowObject.history.state, stateForURL)) {
                        let path = getPathFromState(root, stateForURL, routes);
                        windowObject.history.pushState(stateForURL, '', path);
                        userPreferences.update(stateForURL);
                    }
                }
            }, {
                deep: true
            }
        );

        // Subscribe to changes on the browser's location.
        windowObject.onpopstate = function (event) {
            if (event.state) {
                store.commit('reload', event.state);
            }
        };
    }
}

export default {
    getRedirectedState,
    getMainComponentFromState,
    getPathFromState,
    Router,
    //for unit tests
    flushCaches,
    matchState,
    matchPath,
    getStateFromPath,
};

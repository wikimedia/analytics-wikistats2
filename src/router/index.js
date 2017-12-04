import _ from '../lodash-custom-bundle';

/**
 * Tries to match the given path with the given route.
 *
 * If they match, returns an object with the parameters
 * resulting from the match. For example:
 * Matching the route /:foo/:bar with the path /hello/world
 * will return: {foo: 'hello', bar: 'world'}.
 *
 * If they do not match, returns undefined.
 */
function matchPath (route, path) {
    let [routeParts, pathParts] = [route.split('/'), path.split('/')];
    if (routeParts.length !== pathParts.length) {
        return;
    };
    let params = {};
    for (let [routePart, pathPart] of _.zip(routeParts, pathParts)) {
        if (routePart.startsWith(':') && pathPart !== '') {
            params[routePart.slice(1)] = pathPart;
        } else if (routePart !== pathPart) {
            return;
        }
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
    for (let [route, info] of routes) {
        let state = matchPath(route, path);
        if (state) {
            if (typeof info.redirect === 'string') {
                return getStateFromPath(info.redirect, routes);
            } else if (typeof info.redirect === 'function') {
                return getStateFromPath(info.redirect(state), routes);
            } else {
                return state;
            }
        }
    }
    return {};
}

/**
 * Tries to match the given state with the given route.
 *
 * Returns true if the route contains wildcards for all
 * the properties in the state object, and only those.
 * Returns false otherwise.
 */
function matchState (route, state) {
    let routeKeys = _.filter(route.split('/'), (part) => part.startsWith(':'));
    let stateKeys = _.filter(Object.keys(state), (key) => state[key] !== '');
    if (routeKeys.length !== stateKeys.length) {
        return false;
    }
    for (let routeKey of routeKeys) {
        if (!stateKeys.includes(routeKey.slice(1))) {
            return false;
        }
    }
    return true;
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
        if (matchState(route, state)) {
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
        if (matchState(route, state)) {
            return info.mainComponent;
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
    for (let [route, info] of routes) {
        if (matchState(route, state)) {
            let path = route;
            for (let key of Object.keys(state)) {
                path = path.replace(':' + key, state[key]);
            }
            return root + '#' + path;
        }
    }
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
        let state = getStateFromPath(path, routes);
        windowObject.history.replaceState(state, '', getPathFromState(root, state, routes));
        let mainComponent = getMainComponentFromState(state, routes);
        store.commit('resetNavigationState', Object.assign({mainComponent}, state));

        // Subscribe to changes on the application state.
        store.watch(
            () => {
                return store.getters.mainState
            },
            (mainState) => {
                mainState = _.pickBy(mainState, (property) => property !== '');
                let redirectedState = getRedirectedState(mainState, routes);
                if (redirectedState) {
                    // Update the application state with the redirect
                    // without propagating the change to browser history
                    // or updating the main component.
                    store.commit('resetNavigationState', redirectedState);
                } else {
                    // Update only the main component and the browser's location.
                    store.commit('setState', {
                        mainComponent: getMainComponentFromState(mainState, routes)
                    });
                    if (!_.isEqual(windowObject.history.state, mainState)) {
                        let path = getPathFromState(root, mainState, routes);
                        windowObject.history.pushState(mainState, '', path);
                    }
                }
            },
        );

        // Subscribe to changes on the browser's location.
        windowObject.onpopstate = function (event) {
            if (event.state) {
                store.commit('resetNavigationState', event.state);
            }
        };
    }
}

export default {
    matchPath,
    getStateFromPath,
    matchState,
    getRedirectedState,
    getMainComponentFromState,
    getPathFromState,
    Router,
};

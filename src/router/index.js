
import _ from '../lodash-custom-bundle';
import config from '../config';

const routes = [
  ['/', { redirect: '/all-projects' }],
  ['/:project', { mainComponent: 'dashboard' }],
  ['/:project/:area', { redirect: getDefaultMetricPath }],
  ['/:project/:area/:metric', { mainComponent: 'detail' }],
];

function getDefaultMetricPath (params) {
  let area = _.find(config.areaData(), (item) => item.state.id === params.area);
  return ['', params.project, params.area, area.state.metrics[0]].join('/');
}

function matchPath (route, path) {
  let [routeParts, pathParts] = [route.split('/'), path.split('/')];
  if (routeParts.length !== pathParts.length) {
    return;
  }
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

function getStateFromPath (path) {
  if (path === undefined) {
    path = location.pathname;
  }
  for (let [route, info] of routes) {
    let state = matchPath(route, path);
    if (state) {
      if (typeof info.redirect === 'string') {
        return getStateFromPath(info.redirect);
      } else if (typeof info.redirect === 'function') {
        return getStateFromPath(info.redirect(state));
      } else {
        return state;
      }
    }
  }
  return {};
}

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

function getRedirectedState (state) {
  for (let [route, info] of routes) {
    if (matchState(route, state)) {
      if (typeof info.redirect === 'string') {
        return getStateFromPath(info.redirect);
      } else if (typeof info.redirect === 'function') {
        return getStateFromPath(info.redirect(state));
      }
    }
  }
}

function getMainComponentFromState (state) {
  // This function assumes the passed state
  // does not match with any redirect routes.
  for (let [route, info] of routes) {
    if (matchState(route, state)) {
      return info.mainComponent;
    }
  }
}

function getPathFromState (state) {
  // This function assumes the passed state
  // does not match with any redirect routes.
  for (let [route, info] of routes) {
    if (matchState(route, state)) {
      let path = route;
      for (let key of Object.keys(state)) {
        path = path.replace(':' + key, state[key]);
      }
      return path;
    }
  }
}

class Router {
  constructor (store) {
    let state = getStateFromPath();
    history.pushState(state, '', getPathFromState(state));
    state.mainComponent = getMainComponentFromState(state);
    store.commit('resetState', state);

    store.watch(
      () => {
        return store.getters.mainState
      },
      (mainState) => {
        let redirectedState = getRedirectedState(mainState);
        if (redirectedState) {
          store.commit('resetState', redirectedState);
        } else {
          store.commit('setState', {mainComponent: getMainComponentFromState(mainState)});
          history.pushState(mainState, '', getPathFromState(mainState));
        }
      },
    );

    history.onpopstate = function (event) {
      store.commit('resetState', event.state);
    };
  }
}

export default Router;

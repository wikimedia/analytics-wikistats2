import Vue from 'vue';
import Vuex from 'vuex';

import detail from './detail';
import _ from '../lodash-custom-bundle';

const navigationStateKeys = ['project', 'area', 'metric', 'mainComponent'];
const complexStateKeys = {'detail': detail.readFromURL};

Vue.use(Vuex);
export default new Vuex.Store({
    modules: {
        detail: detail.module,
    },
    state: {
        project: '',
        area: '',
        metric: '',
        mainComponent: '',
        topicsMinimized: false,
        centralNotice: null,
        width: null
    },
    getters: {
        // Do not add mainComponent to mainState
        // to avoid infinite update loops.
        mainState: state => ({
            project: state.project,
            area: state.area,
            metric: state.metric,
        }),
        stateForURL: (state, getters) => {
            let forURL = Object.assign({}, getters.mainState);

            // only expose the detail to the URL if the metric is specified,
            //   so that the other routes like /:project don't break
            if (!(_.isEmpty(state.metric))) {
                forURL.detail = detail.writeToURL(state.detail);
            }
            return forURL;
        },
        getWidth: state => state.width
    },
    mutations: {
        navigate (state, arg) {
            state.mainComponent = arg.component;
        },
        // Sets all poperties passed, and sets any remaining navigation properties to empty string.
        reload (state, arg) {
            navigationStateKeys.forEach(k => state[k] = '');
            //Object.assign(state.detail, detail.defaultState);
            Object.keys(arg).forEach(k => {
                const readFromURL = complexStateKeys[k] || (x => x);
                state[k] = readFromURL(arg[k]);
            });
        },
        project (state, arg) {
            state.project = arg.project;
        },
        metric (state, arg) {
            state.area = arg.area;
            state.metric = arg.metric;
        },
        topicExplorer (state, arg) {
            state.topicsMinimized = arg.minimize;
        },
    },
});

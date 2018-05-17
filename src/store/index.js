import Vue from 'vue';
import Vuex from 'vuex';

import detail from './detail';

const navigationStateKeys = ['project', 'area', 'metric', 'mainComponent'];

Vue.use(Vuex);
export default new Vuex.Store({
    modules: {
        detail,
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
        mainState: state => {
            return {
                project: state.project,
                area: state.area,
                metric: state.metric,
            };
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
            state.activeBreakdown = null;
            Object.keys(arg).forEach(k => state[k] = arg[k]);
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

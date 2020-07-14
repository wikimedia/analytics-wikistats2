import Vue from 'vue';
import Vuex from 'vuex';

import detail from './detail';
import dimensions from './dimensions';
import _ from '../lodash-custom-bundle';

const navigationStateKeys = ['project', 'area', 'metric', 'mainComponent', 'section'];
const complexStateAdapters = {'detail': detail.readFromURL};

Vue.use(Vuex);
export default new Vuex.Store({
    //strict: true,
    modules: {
        detail: detail.module,
        dimensions
    },
    state: {
        project: '',
        area: '',
        metric: '',
        mainComponent: '',
        topicsMinimized: false,
        centralNotice: null,
        selectingTime: false,
        width: null
    },
    getters: {
        // Do not add mainComponent to mainState
        // to avoid infinite update loops.
        mainState: state => ({
            project: state.project,
            area: state.area,
            metric: state.metric,
            section: state.section
        }),
        stateForURL: (state, getters) => {
            let forURL = Object.assign({}, getters.mainState);
            if(!_.isEmpty(state.detail)) {
                const dimensions = state.dimensions.dimensions;
                state.detail.dimensions = dimensions;
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
            this.commit('detail/reset');
            Object.keys(arg).forEach(k => {
                const readFromURL = complexStateAdapters[k] || (x => x);
                state[k] = readFromURL(arg[k], state);
            });
            this.commit('dimensions/dimensions', state.detail.dimensions);
        },
        project (state, arg) {
            state.project = arg.project;
        },
        metric (state, arg) {
            state.section = '';
            state.area = arg.area;
            state.metric = arg.metric;
            this.commit('detail/reset');
        },
        topicExplorer (state, arg) {
            state.topicsMinimized = arg.minimize;
        },
        selectingTime (state, arg) {
            state.selectingTime = arg.selectingTime;
        }
    },
});

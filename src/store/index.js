import Vue from 'vue';
import Vuex from 'vuex';

const navigationStateKeys = ['project', 'area', 'metric', 'mainComponent'];

Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        project: '',
        area: '',
        metric: '',
        mainComponent: '',
        topicsMinimized: true,
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
    },
    mutations: {
        // Sets all poperties passed, and leaves the others as they were.
        setState (state, arg) {
            Object.keys(arg).forEach(k => state[k] = arg[k]);
        },
        // Sets all poperties passed, and sets any remaining navigation properties to empty string.
        resetState (state, arg) {
            navigationStateKeys.forEach(k => state[k] = '');
            Object.keys(arg).forEach(k => state[k] = arg[k]);
        },
    },
});

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        project: '',
        area: '',
        metric: '',
        mainComponent: '',
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
        // Sets all poperties passed, and sets the others to empty string.
        resetState (state, arg) {
            for (let key of Object.keys(state)) {
                state[key] = '';
            }
            Object.keys(arg).forEach(k => state[k] = arg[k]);
        },
    },
});

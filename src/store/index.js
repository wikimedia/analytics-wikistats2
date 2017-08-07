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
        mainState: state => {
            return {
                project: state.project,
                area: state.area,
                metric: state.metric,
            };
        },
    },
    mutations: {
        setState (state, arg) {
            console.log('setState', state, arg);
            Object.keys(arg).forEach(k => state[k] = arg[k]);
        },
        resetState (state, arg) {
            console.log('resetState', state, arg);
            for (let key of Object.keys(state)) {
                state[key] = '';
            }
            Object.keys(arg).forEach(k => state[k] = arg[k]);
        },
    },
});

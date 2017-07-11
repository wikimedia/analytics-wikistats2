import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        project: '',
        area: '',
        metric: '',
    },
    getters: {
        mainState: state => {
            return {
                project: state.project,
                area: state.area,
                metric: state.metric,
            };
        }
    },
    mutations: {
        setState (state, arg) {
            Object.keys(arg).forEach(k => state[k] = arg[k]);
        },
    },
});

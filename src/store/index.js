import Vue from 'vue';
import Vuex from 'vuex';

import sitematrix from '../apis/Sitematrix';
import config from '../apis/Configuration'


Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        area: '',
        project: '',
        metric: '',
    },
    getters: {
        projectCode: state => state.project,
        area: state => state.area,
        metric: state => state.metric,
    },
    mutations: {
        setState (state, arg) {
            Object.keys(arg).forEach(k => state[k] = arg[k]);
        },
    },
    actions: {

        setProject ({ commit }, project) {
            commit('setState', { project });
        },

        setAreasByConfig ({ commit }) {
            config.areaData().then(function (areas) {
                commit('setState', { areas });
            })
        },
    },
});

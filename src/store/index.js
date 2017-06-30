import Vue from 'vue';
import Vuex from 'vuex';

import sitematrix from '../apis/Sitematrix';
import config from '../apis/Configuration'


Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        areas: [],
        project: {},
    },
    getters: {
        projectCode: state => state.project.code,
    },
    mutations: {

        setState (state, arg) {
            Object.keys(arg).forEach(k => state[k] = arg[k]);
        },
    },
    actions: {

        setProjectByCode ({ commit }, arg) {
            sitematrix.findByFamilyAndCode(arg.family, arg.code).then(project => {
                commit('setState', { project });
            });
        },

        setAreasByConfig ({ commit }) {
            config.areaData().then(function (areas) {
                commit('setState', { areas });
            })
        },
    },
});

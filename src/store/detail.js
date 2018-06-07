import utils from '../utils';
import detailURL from '../router/urls/detail';

const module = {
    namespaced: true,

    state: {},

    mutations: {
        reset (state) {
            for (let k in state) { delete state[k]; }
        },
        fullscreen (state, arg) {
            state.fullscreen = arg.fullscreen;
        },
        chartType (state, arg) {
            state.chartType = arg.chartType;
        },
        timeRange (state, arg) {
            state.timeRange = arg.timeRange;
        },
        breakdown (state, arg) {
            state.breakdown = arg.breakdown;
        },
    },
};

export default {
    module,
    writeToURL: detailURL.writeToURL,
    readFromURL: detailURL.readFromURL,
};

import utils from '../utils';

const defaultRange = utils.getDefaultTimeRange();

export default {
    namespaced: true,

    state: {
        fullscreen: false,
        chartType: 'empty',
        timeRange: defaultRange,
        split: 'total',
        filter: [],
    },

    mutations: {
        fullscreen (state, arg) {
            state.fullscreen = arg.fullscreen;
        },
        chartType (state, arg) {
            state.chartType = arg.chartType;
        },
        timeRange (state, arg) {
            state.timeRange = arg.timeRange;
        },
        split (state, arg) {
            state.split = arg.split;
        },
        filter (state, arg) {
            state.filter = arg.filter;
        },
    },
};

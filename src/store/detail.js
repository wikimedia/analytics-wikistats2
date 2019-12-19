import utils from '../utils';
import detailURL from '../router/urls/detail';
import config from 'Src/config';
import TimeRange from 'Src/models/TimeRange';

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
            let timeRange = arg.timeRange;
            const metricConfig = config.metricConfig(this.state.metric);
            if (arg.timeRange.timeKeyword === 'all') {
                timeRange = TimeRange.getAllTimeRange(metricConfig);
            }
            state.timeRange = timeRange;
        },
        breakdown (state, arg) {
            state.breakdown = arg.breakdown;
        },
        granularity (state, arg) {
            state.granularity = arg.granularity;
        },
    },
};

export default {
    module,
    writeToURL: detailURL.writeToURL,
    readFromURL: detailURL.readFromURL,
};

import utils from '../utils';
import detailURL from '../router/urls/detail';
import config from 'Src/config';
import TimeRange from 'Src/models/TimeRange';
import Vue from 'vue';

const module = {
    namespaced: true,

    state: {
        dimensionsModalEnabled: false
    },

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
        dimensionsModalEnabled (state, {enabled}) {
            Vue.set(state, 'dimensionsModalEnabled', enabled);
        }
    },
};

export default {
    module,
    writeToURL: detailURL.writeToURL,
    readFromURL: detailURL.readFromURL,
};

import utils from '../utils';

const defaultRange = utils.getDefaultTimeRange();
const defaultState = {
    fullscreen: false,
    chartType: 'empty',
    timeRange: defaultRange,
    breakdown: null,
};

const TOP_LEVEL     = '|',
      SECOND_LEVEL  = '~',
      THIRD_LEVEL   = '*';

function writeToURL (detail) {
    // simpler: return encodeURIComponent(JSON.stringify(detail));
    return [
        detail.fullscreen ? 'full' : 'normal',
        detail.chartType,
        [detail.timeRange.name, detail.timeRange.start, detail.timeRange.end].join(SECOND_LEVEL),
        detail.breakdown ? [
            detail.breakdown.breakdownName,
            detail.breakdown.values.filter(bv => bv.on).map(bv => bv.key).join(THIRD_LEVEL),
        ].join(SECOND_LEVEL) : '',
    ].join(TOP_LEVEL);
}
function readFromURL (encoded) {
    // simpler: return JSON.parse(decodeURIComponent(encoded));
    const parts = encoded.split(TOP_LEVEL);
    const rangeParts = parts[2].split(SECOND_LEVEL);
    const breakdownParts = parts[3].split(SECOND_LEVEL);

    return {
        fullscreen: parts[0] === 'full',
        chartType: parts[1],
        timeRange: {
            name: rangeParts[0],
            start: rangeParts[1],
            end: rangeParts[2],
        },
        breakdown: breakdownParts ? {
            breakdownName: breakdownParts[0],
            values: breakdownParts[1].split(THIRD_LEVEL).map(key => ({ key, on: true })),
        } : null,
    };
}

const module = {
    namespaced: true,

    state: Object.assign({}, defaultState),

    mutations: {
        reset (state) {
            Object.assign(state, defaultState);
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
    defaultState,
    writeToURL,
    readFromURL,
};

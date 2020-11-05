import dateFormat from 'dateformat';
import TimeRange from 'Src/models/TimeRange';
import config from 'Src/config';
import Dimension from 'Src/models/Dimension';

const TOP_LEVEL     = '|',
      FIRST_LEVEL  = '+',
      SECOND_LEVEL  = '~',
      THIRD_LEVEL   = '*',
      DATE_FORMAT   = 'yyyy-mm-dd';

function writeToURL (detail) {
    if (!detail || !detail.timeRange) return '';
    const timeRange = new TimeRange(detail.timeRange);
    return [
        detail.fullscreen ? 'full' : 'normal',
        detail.chartType,
        timeRange.timeKeyword || [
            dateFormat(timeRange.start, DATE_FORMAT, true),
            dateFormat(timeRange.end, DATE_FORMAT, true)
        ].join(SECOND_LEVEL),
        encodeDimensionsState(detail.dimensions),
        detail.granularity
    ].join(TOP_LEVEL);
}

function readFromURL (encodedDetail, state) {
    if (encodedDetail == '') return {};
    // decode the URI because some user agents, like iOS Chrome,
    // will automatically encode some characters, like "|"
    encodedDetail = decodeURIComponent(encodedDetail);
    const parts = encodedDetail.split(TOP_LEVEL);
    const rangeParts = parts[2].split(SECOND_LEVEL);
    const timeRange = new TimeRange(rangeParts.length > 1 ? rangeParts : rangeParts[0]);
    const breakdownParts = parts[3].split(SECOND_LEVEL);
    const dimensionsEncoded = parts[3];
    const granularity = parts[4];

    return {
        fullscreen: parts[0] === 'full',
        chartType: parts[1],
        timeRange: timeRange,
        // TODO: refactor out breakdowns again later
        breakdown: breakdownParts ? {
            key: breakdownParts[0],
            values: breakdownParts[1].split(THIRD_LEVEL).map(key => ({ key, on: true })),
        } : {values: [{key: 'total', on: true}]},
        dimensions: decodeDimensionsStateFromEncoded(dimensionsEncoded, state.metric),
        granularity: granularity
    };
}

const decodeDimensionsStateFromEncoded = (encoded, metric) => {
    if (!encoded) { return null; }

    const metricConfig = config.metricConfig(metric);
    // TODO: refactor out breakdowns again later
    const dimensionsConfig = metricConfig.breakdowns || [];
    const decoded = {};

    encoded.split(FIRST_LEVEL).forEach(dimString => {
        const [dimKey, activeValues] = dimString.split(SECOND_LEVEL);
        // decode dimensions except the special case ~total
        if (dimKey && dimKey.length) {
            const splitting = !(dimKey[0] === '(' && dimKey[dimKey.length - 1] === ')');
            const dimensionKey = splitting ? dimKey : dimKey.substring(1, dimKey.length - 1);

            decoded[dimensionKey] = {
                values: new Set(activeValues.split(THIRD_LEVEL)),
                splitting
            };
        }
    });

    return dimensionsConfig.map(dimensionConfig => {
        const dimension = new Dimension(dimensionConfig);
        const dimensionFromURL = decoded[dimension.key];

        dimension.active = !!dimensionFromURL;
        if (dimension.active) {
            dimension.splitting = dimensionFromURL.splitting;
            dimension.values.forEach(value => { value.on = dimensionFromURL.values.has(value.key); })
        }
        return dimension;
    })
};

/**
 * Encodes like: splitting-dimension~value1*value2+(non-splitting-dimension)~value1*value3*value4
 */
const encodeDimensionsState = (dimensions = []) => {
    const activeDimensions = dimensions.filter(dimension => dimension.active);
    if (activeDimensions.length === 0) {
        return SECOND_LEVEL + 'total';
    }
    return activeDimensions.map(dimension => {
        const values = dimension.values.filter(v => v.on).map(v => v.key);
        const dim = dimension.splitting ? dimension.key : `(${dimension.key})`;
        return dim + SECOND_LEVEL + values.join(THIRD_LEVEL);
    }).join(FIRST_LEVEL);
};

export default {
    writeToURL,
    readFromURL,
    decodeDimensionsStateFromEncoded,
    encodeDimensionsState
};

import dateFormat from 'dateformat';
import TimeRange from 'Src/models/TimeRange';
import config from 'Src/config';
import Dimension from 'Src/models/Dimension';

const TOP_LEVEL     = '|',
      SECOND_LEVEL  = '~',
      THIRD_LEVEL   = '*',
      DATE_FORMAT   = 'yyyy-mm-dd';

function writeToURL (detail) {
    // simpler: return encodeURIComponent(JSON.stringify(detail));
    if (Object.keys(detail).length === 0) return '';
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
        breakdown: breakdownParts ? {
            key: breakdownParts[0],
            values: breakdownParts[1].split(THIRD_LEVEL).map(key => ({ key, on: true })),
        } : {values: [{key: 'total', on: true}]},
        dimensions: dimensionsEncoded && decodeDimensionsStateFromEncoded(dimensionsEncoded, state.metric),
        granularity: granularity
    };
}

const decodeDimensionsStateFromEncoded = (encoded, metric) => {
    const metricConfig = config.metricConfig(metric);
    const dimensionsConfig = metricConfig.breakdowns || [];
    const decoded = {};
    const mainParts = encoded.split(SECOND_LEVEL);
    if (mainParts[0] !== '') {
        for (let i = 0; i < mainParts.length; i += 2){
            let dimensionKey = mainParts[i];
            // split if key has a dash at its end
            let splitting = true;
            if (dimensionKey.substr(-1) === '-') {
                splitting = false;
                dimensionKey = dimensionKey.substr(0, dimensionKey.length - 1);
            };
            const encodedDimensionValues = mainParts[i + 1];
            const activeDimensionValues = encodedDimensionValues.split(THIRD_LEVEL);
            decoded[dimensionKey] = {
                values: activeDimensionValues,
                splitting
            }
        }
    }
    return dimensionsConfig.map(dimensionConfig => {
        const dimension = new Dimension(dimensionConfig);
        const key = dimension.key;
        const dimensionFromURL = decoded[key];
        dimension.active = !!dimensionFromURL;
        if (dimension.active) {
            dimension.splitting = dimensionFromURL.splitting;
            dimension.values.forEach(value => {
                value.on = false;
                if (dimensionFromURL.values.includes(value.key)) value.on = true;
            })
        }
        return dimension;
    })
};

const encodeDimensionsState = (dimensions = []) => {
    const activeDimensions = dimensions.filter(dimension => dimension.active);
    if (activeDimensions.length === 0) {
        return SECOND_LEVEL + 'total';
    }
    let encodedParts = [];
    dimensions.forEach(dimension => {
        let encoded = '';
        if (!dimension.active) return;
        encoded += dimension.key;
        if (!dimension.splitting) encoded += '-';
        encoded += SECOND_LEVEL;
        const values = dimension.values;
        const activeValueKeys = values.filter(v => v.on).map(v => v.key);
        encoded += activeValueKeys.join(THIRD_LEVEL);
        encodedParts.push(encoded);
    });
    return encodedParts.join(SECOND_LEVEL);
};

export default {
    writeToURL,
    readFromURL,
    decodeDimensionsStateFromEncoded,
    encodeDimensionsState
};

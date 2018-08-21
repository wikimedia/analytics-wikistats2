import dateFormat from 'dateformat';

const TOP_LEVEL     = '|',
      SECOND_LEVEL  = '~',
      THIRD_LEVEL   = '*',
      DATE_FORMAT   = 'yyyy-mm-dd';

function writeToURL (detail) {
    // simpler: return encodeURIComponent(JSON.stringify(detail));
    if (Object.keys(detail).length === 0) return '';
    return [
        detail.fullscreen ? 'full' : 'normal',
        detail.chartType,
        detail.timeRange.name ? detail.timeRange.name : [
            dateFormat(detail.timeRange.start, DATE_FORMAT, true),
            dateFormat(detail.timeRange.end, DATE_FORMAT, true)
        ].join(SECOND_LEVEL),
        detail.breakdown ? [
            detail.breakdown.breakdownName,
            detail.breakdown.values.filter(bv => bv.on).map(bv => bv.key).join(THIRD_LEVEL),
        ].join(SECOND_LEVEL) : SECOND_LEVEL + 'total',
    ].join(TOP_LEVEL);
}

function readFromURL (encoded) {
    if (encoded == '') return {};
    // decode the URI because some user agents, like iOS Chrome,
    // will automatically encode some characters, like "|"
    encoded = decodeURIComponent(encoded);
    const parts = encoded.split(TOP_LEVEL);
    const rangeParts = parts[2].split(SECOND_LEVEL);
    const breakdownParts = parts[3].split(SECOND_LEVEL);

    return {
        fullscreen: parts[0] === 'full',
        chartType: parts[1],
        timeRange: rangeParts.length === 1 ? {name: rangeParts[0]} : {
            start: Date.parse(rangeParts[0]),
            end: Date.parse(rangeParts[1])
        },
        breakdown: breakdownParts ? {
            breakdownName: breakdownParts[0],
            values: breakdownParts[1].split(THIRD_LEVEL).map(key => ({ key, on: true })),
        } : {values: [{key: 'total', on: true}]}
    };
}

export default {
    writeToURL,
    readFromURL,
};

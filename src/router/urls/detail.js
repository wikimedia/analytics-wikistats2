const TOP_LEVEL     = '|',
      SECOND_LEVEL  = '~',
      THIRD_LEVEL   = '*';

function writeToURL (detail) {
    // simpler: return encodeURIComponent(JSON.stringify(detail));
    if (Object.keys(detail).length === 0) return '';
    return [
        detail.fullscreen ? 'full' : 'normal',
        detail.chartType,
        [detail.timeRange.name, detail.timeRange.start, detail.timeRange.end].join(SECOND_LEVEL),
        detail.breakdown ? [
            detail.breakdown.breakdownName,
            detail.breakdown.values.filter(bv => bv.on).map(bv => bv.key).join(THIRD_LEVEL),
        ].join(SECOND_LEVEL) : SECOND_LEVEL + 'total',
    ].join(TOP_LEVEL);
}

function readFromURL (encoded) {
    // simpler: return JSON.parse(decodeURIComponent(encoded));
    if (encoded == '') return {};
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
        } : {values: [{key: 'total', on: true}]}
    };
}

export default {
    writeToURL,
    readFromURL,
};

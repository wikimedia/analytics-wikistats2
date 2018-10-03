import {
    processRawAnnotations,
    groupIfOverlapping,
    inDateRange,

} from '../src/models/Annotations'

function getAnnotations () {
    return [
        { date: 'aaa', x: 5,  note: { title: 'aaa note', label: 'should be filtered out' } },
        { date: 'aab', x: 10, note: { title: 'aab note', label: 'should be merged with aac' } },
        { date: 'aac', x: 15, note: { title: 'aac note', label: 'should be merged with aab' } },
        { date: 'aad', x: 25, note: { title: 'aad note', label: 'should stay as is' } },
        { date: 'zzyz', x: 50, note: { title: 'zzy note', label: 'should also stay as is' } },
        { date: 'zzz', x: 55, note: { title: 'zzz note', label: 'should be filtered out' } },
    ];
}

function getGraphModel () {
    return {
        graphData: [
            { month: 'aab', total: { total: 100 } },
            { month: 'aaca', total: { total: 130 } },
            { month: 'aada', total: { total: 160 } },
            { month: 'zzy', total: { total: 200 } },
        ],
        activeBreakdown: {
            breakdownName: 'total',
            values: [ { on: true, key: 'total' } ],
        },
    };
}

describe('Annotations', function () {
    // TODO: Add test for broken down annotations

    it('should process raw annotations', function () {
        const annotations = getAnnotations();
        const graphModel = getGraphModel();
        const filteredAndExpanded = processRawAnnotations(annotations, graphModel);

        expect(filteredAndExpanded.length).toEqual(6);
    });

    it('should group overlapping annotations', function () {
        const annotations = getAnnotations();
        const graphModel = getGraphModel();
        const filteredAndExpanded = processRawAnnotations(annotations, graphModel);
        const grouped = groupIfOverlapping(filteredAndExpanded, 6);
        const trimmed = inDateRange(filteredAndExpanded, 'aac', 'aad');

        expect(grouped.length).toEqual(4)
        expect(trimmed.length).toEqual(2)
    });
});

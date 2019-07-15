import TimeRange from '../src/models/TimeRange';

describe('The TimeRange', () => {
    it('should return the correct number of months between two dates', () => {
        expect(new TimeRange(['2016-06-01', '2017-06-01']).getSpan('monthly'))
            .toEqual(12);
        expect(new TimeRange(['2016-06-01', '2016-09-01']).getSpan('monthly'))
            .toEqual(4);
    });

    it('should return the correct number of days between two dates', () => {
        expect(new TimeRange(['2016-06-01', '2016-07-01']).getSpan('daily'))
            .toEqual(31);
        expect(new TimeRange(['2016-06-01', '2016-06-03']).getSpan('daily'))
            .toEqual(3);
    });
});
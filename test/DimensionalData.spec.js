import DimensionalData from '../src/models/DimensionalData'

const pageviews1 = [
    { date: '2017-01', agent: 'user', access: 'desktop', views: 10 },
    { date: '2017-01', agent: 'user', access: 'desktop', views: 13 },
    { date: '2017-02', agent: 'user', access: 'desktop', views: 20 },
    { date: '2017-03', agent: 'user', access: 'desktop', views: 30 },
    { date: '2017-04', agent: 'user', access: 'desktop', views: 40 },
]

const pageviews2 = [
    { date: '2017-01', agent: 'spider', access: 'desktop', views: 1 },
    { date: '2017-02', agent: 'spider', access: 'desktop', views: 2 },
    { date: '2017-03', agent: 'spider', access: 'desktop', views: 3 },
    { date: '2017-04', agent: 'spider', access: 'desktop', views: 4 },
]

const pageviews3 = [
    { date: '2017-01', agent: 'user', access: 'mobile', views: 15 },
    { date: '2017-02', agent: 'user', access: 'mobile', views: 25 },
    { date: '2017-03', agent: 'user', access: 'mobile', views: 35 },
    { date: '2017-04', agent: 'user', access: 'mobile', views: 45 },
]

describe('DimensionalData', function () {
    it('should be able to return its crossfilter instance', function () {
        let dim = new DimensionalData();

        expect(dim.getCrossfilter().add).not.toBeUndefined();
    });

    it('should return the sum value for a set of records', function () {
        let dim = new DimensionalData(pageviews1);

        expect(dim.total('views')).toEqual(113);
    });

    it('should merge results', function () {
        let dim = new DimensionalData(pageviews1)

        dim.merge(pageviews2)
        expect(dim.total('views')).toEqual(123)
    });

    it('should break down by any column', function () {
        let dim = new DimensionalData(pageviews1)
        dim.measure('views')
        let break1 = dim.breakdown('date')

        expect(break1.find((x) => x.date === '2017-01').views).toEqual(23)

        dim.merge(pageviews2)
        let break2 = dim.breakdown('date')

        expect(break2.find((x) => x.date === '2017-01').views).toEqual(24)
    });

    it('should break down by two columns', function () {
        let dim = new DimensionalData(pageviews1)
        dim.merge(pageviews2)
        dim.merge(pageviews3)
        dim.measure('views')
        let break1 = dim.breakdown('date', 'agent')

        expect(break1.find(
            (x) => x.date === '2017-01' && x.agent === 'user').views
        ).toEqual(38)
    });

    it('should report unique values in a column', function () {
        let dim = new DimensionalData(pageviews1)
        expect(dim.unique('date')).toEqual(['2017-01', '2017-02', '2017-03', '2017-04'])
    });

    it('should filter to include only a list of values in a column', function () {
        let dim = new DimensionalData(pageviews1)

        dim.filter('date', '2017-02');
        expect(dim.total('views')).toEqual(20)
    });
})

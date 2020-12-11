import AQS from '../../src/apis/aqs';
import TimeRange from '../../src/models/TimeRange';
import Dimension from 'Src/models/Dimension';


let uniqueParameters = {
    project: ['en.wikipedia', 'fr.wikipedia'],
    access: ['desktop', 'mobile-web']
};
let commonParameters = {
    metric: 'total-page-views', agent: 'user',
    granularity: 'monthly', start: new Date('2017-01-01'), end: new Date('2017-06-01'),
    timeRange: new TimeRange(['2017-01-01', '2017-06-01'])
};

describe('AQS', function () {

    it('should call pageviews with correct parameters', function () {
        const spy = jest.spyOn($, "ajax");
        const dimensions = [{
            key: 'access',
            active: true,
            splitting: true,
            allValue: 'all-access',
            values: [
                { name: 'Desktop', on: true, key: 'desktop' },
                { name: 'Mobile App', on: true, key: 'mobile-app' },
                { name: 'Mobile Web', on: true, key: 'mobile-web' }
            ]
        }, {
            key: 'agent',
            active: true,
            splitting: false,
            allValue: 'all-agents',
            values: [
                { name: 'User', on: true, key: 'user' },
                { name: 'Spider', on: true, key: 'spider' },
                { name: 'Automated', on: true, key: 'automated' },
            ]
        }].map(d => new Dimension(d));
        let a = new AQS();
        let answer = a.getData(uniqueParameters, commonParameters, dimensions);

        expect(spy).toHaveBeenCalledTimes(3);
        expect(spy.mock.calls[0][0].url).toEqual('https://wikimedia.org/api/rest_v1/metrics/pageviews/aggregate/en.wikipedia/desktop/user/monthly/2017010100/2017060100');
    });
});

import AQS from '../../src/apis/aqs'
import TimeRange from '../../src/models/TimeRange'


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
    beforeEach(function() {
        jasmine.Ajax.install();
      });

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

    it('should call pageviews with correct parameters', function () {
        let a = new AQS();
        let answer = a.getData(uniqueParameters, commonParameters);

        expect(jasmine.Ajax.requests.count()).toEqual(4);
        expect(jasmine.Ajax.requests.first().url)
            .toEqual('https://wikimedia.org/api/rest_v1/metrics/pageviews/aggregate/en.wikipedia/desktop/user/monthly/2017010100/2017060100');
    });
});

import AQS from '../../src/apis/aqs'


let uniqueParameters = {
    project: ['en.wikipedia', 'fr.wikipedia'],
    access: ['desktop', 'mobile-web']
};
let commonParameters = {
    metric: 'pageviews-aggregate', agent: 'user',
    granularity: 'monthly', start: '2017010100', end: '2017060100'
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
            .toEqual('https://wikimedia.org/api/rest_v1/metrics/pageviews/aggregate/' +
                     'en.wikipedia/desktop/user/monthly/2017010100/2017060100');
    });
});

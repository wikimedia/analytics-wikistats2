import DimensionalData from '../src/models/DimensionalData'
import GraphModel from '../src/models/GraphModel'
import TimeRange from '../src/models/TimeRange'

import config from '../src/config'
import uniques from './mocks/uniques'
import uniquesDaily from './mocks/uniquesDaily'

const metric = {
    type: 'lines',
    value: 'devices',
    area: 'reading',
    breakdowns: [{
        on: false,
        name: 'Access site',
        breakdownName: 'access-site',
        values: [
            { name: 'Mobile Site', on: true, key: 'mobile-site' },
            { name: 'Desktop Site', on: true, key: 'desktop-site' }
        ]
    }],
};

let dimensionalData = new DimensionalData(uniques.desktop.items);
dimensionalData.merge(uniques.mobile.items);
let graphModel = null;

describe('GraphModel', function () {
    beforeEach(() => {
        graphModel = new GraphModel('es.wikipedia.org', 'unique-devices');
        graphModel.timeRange = new TimeRange(['2016-06-01', '2017-06-01']);
        graphModel.setData(dimensionalData);
    })

    it('should reflect basic properties', function () {
        expect(graphModel.area).toEqual(metric.area);
        expect(graphModel.breakdowns[1].name).toEqual(metric.breakdowns[0].name);
    });

    it('should aggregate total when metric is additive', function () {
        graphModel.config.additive = true;
        expect(graphModel.getAggregateLabel()).toEqual('Total');
        expect(graphModel.getAggregate()).toEqual(1449174299);
        expect(graphModel.getLimitedAggregate(3)).toEqual(388510241);
        expect(graphModel.getLimitedAggregate(300)).toEqual(1449174299);
    });

    it('should aggregate average when metric is not additive', function () {
        graphModel.config.additive = false;
        expect(graphModel.getAggregateLabel()).toEqual('Average');
        expect(graphModel.getAggregate()).toEqual(120764524.9);
    });

    it('should total properly when breaking down', function () {
        graphModel.config.additive = true;
        graphModel.activeBreakdown = graphModel.breakdowns[1];
        graphModel.setData(dimensionalData);
        graphModel.activeBreakdown.values[0].on = true;
        graphModel.activeBreakdown.values[1].on = false;
        expect(graphModel.getAggregate()).toEqual(882978744);

        graphModel.activeBreakdown.values[0].on = false;
        graphModel.activeBreakdown.values[1].on = true;
        expect(graphModel.getAggregate()).toEqual(566195555);
    });

    it('should average properly when breaking down', function () {
        graphModel.config.additive = false;
        graphModel.activeBreakdown = graphModel.breakdowns[1];
        graphModel.setData(dimensionalData);

        graphModel.activeBreakdown.values[0].on = true;
        graphModel.activeBreakdown.values[1].on = false;
        expect(graphModel.getAggregate()).toEqual(73581562);

        graphModel.activeBreakdown.values[0].on = false;
        graphModel.activeBreakdown.values[1].on = true;
        expect(graphModel.getAggregate()).toEqual(47182962.9);
    });

    it('should add zeroes when dates are missing', function () {
        // There is a data hole in the middle
        const brokenInTheMiddle = uniques.desktop.items.slice(0,3).concat(uniques.desktop.items.slice(6));
        let dimensionalData = new DimensionalData(brokenInTheMiddle);
        expect(dimensionalData.getAllItems().length).toEqual(9);
        graphModel.setData(dimensionalData);
        expect(graphModel.graphData.length).toEqual(12);
        expect(graphModel.graphData[4].total.total).toEqual(0);

        // Beginning of data doesn't match time range
        const beginningMissing = uniques.desktop.items.slice(3);
        dimensionalData = new DimensionalData(beginningMissing);
        expect(dimensionalData.getAllItems().length).toEqual(9);
        graphModel.setData(dimensionalData);
        expect(graphModel.graphData.length).toEqual(12);
        expect(graphModel.graphData[0].total.total).toEqual(0);

        // Daily granularity
        graphModel.setGranularity('daily');
        graphModel.setTimeRange(new TimeRange(['2016-12-01', '2016-12-12']));
        const brokenDaily = uniquesDaily.desktop.items.slice(0,3).concat(uniquesDaily.desktop.items.slice(6));
        dimensionalData = new DimensionalData(brokenDaily);
        expect(dimensionalData.getAllItems().length).toEqual(9);
        graphModel.setData(dimensionalData);
        expect(graphModel.graphData.length).toEqual(12);
        expect(graphModel.graphData[4].total.total).toEqual(0);
    })
    // NOTE: commented out for now because this feature causes a rather serious bug
    //it('should adjust the time range when data received doesn\'t match it', () => {
        //graphModel.setGranularity('daily');
        //graphModel.setTimeRange(new TimeRange(['2016-12-01', '2016-12-14']));
        //const dataUntilThe12th = new DimensionalData(uniquesDaily.desktop.items);
        //graphModel.setData(dataUntilThe12th);
        //expect(graphModel.timeRange.end.getUTCDate()).toEqual(12);
    //})
});

import Vue from 'vue'
import LineChart from '../../src/components/detail/chart/LineChart.vue'
import GraphModel from '../../src/models/GraphModel'
import TimeRange from '../../src/models/TimeRange'
import DimensionalData from '../../src/models/DimensionalData'
import config from '../../src/config'
import uniques from '../mocks/uniques'

const metric = {
    type: 'lines',
    value: 'devices',
    area: 'reading',
    breakdowns: [{
        name: 'Access site',
        breakdownName: 'access-site',
        values: [
            { name: 'Mobile Site', on: true, key: 'mobile-site' },
            { name: 'Desktop Site', on: true, key: 'desktop-site' }
        ]
    }]
};

let dimensionalData = new DimensionalData(uniques.desktop.items);
dimensionalData.merge(uniques.mobile.items);


describe('The line chart', () => {
    it('should generate one line when there are no breakdowns selected', () => {
        const graphModel = new GraphModel('es.wikipedia.org', 'unique-devices');
        graphModel.timeRange = new TimeRange(['2016-06-01', '2017-07-01']);
        graphModel.setData(dimensionalData);
        const vm = new Vue({
            template: '<div><test :graphModel="graphModel" :data="graphModel.graphData"></test></div>',
            components: {
                'test': LineChart
            },
            data () {
                return {
                    graphModel
                }
            }
        }).$mount();
        expect($('.breakdownLine', vm.$el).length).toEqual(1);
    });

    it('should generate as many lines as breakdowns selected', () => {
        const graphModel = new GraphModel('es.wikipedia.org', 'unique-devices');
        graphModel.timeRange = new TimeRange(['2016-06-01', '2017-07-01']);
        graphModel.activeBreakdown = graphModel.breakdowns[1];
        graphModel.setData(dimensionalData);

        const vm = new Vue({
            template: '<div><test :graphModel="graphModel"></test></div>',
            components: {
                'test': LineChart
            },
            data () {
                return {
                    graphModel
                }
            }
        }).$mount();
        expect($('.breakdownLine', vm.$el).length).toEqual(2);
    });

    it('should generate an x axis', function () {
        const graphModel = new GraphModel('es.wikipedia.org', 'unique-devices');
        graphModel.timeRange = new TimeRange(['2016-06-01', '2017-07-01']);
        graphModel.setData(dimensionalData);
        const vm = new Vue({
            template: '<div><test :graphModel="graphModel" :data="graphModel.graphData"></test></div>',
            components: {
                'test': LineChart
            },
            data () {
                return {
                    graphModel
                }
            }
        }).$mount();
        expect($('.xAxisLabel', vm.$el).length).toBeGreaterThan(0);
    });
});

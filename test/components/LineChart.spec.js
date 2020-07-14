import Vue from 'vue'
import LineChart from '../../src/components/detail/chart/LineChart.vue'
import GraphModel from '../../src/models/GraphModel'
import Dimension from '../../src/models/Dimension'
import TimeRange from '../../src/models/TimeRange'
import DimensionalData from '../../src/models/DimensionalData'
import config from '../../src/config'
import uniques from '../mocks/uniques'
import getVueComponent from '../util/getVueComponent';

const metric = Object.freeze({
    type: 'lines',
    value: 'devices',
    area: 'reading',
    breakdowns: [{
        name: 'Access site',
        key: 'access-site',
        allValue: 'all-access',
        values: [
            { name: 'Mobile Site', on: true, key: 'mobile-site' },
            { name: 'Desktop Site', on: true, key: 'desktop-site' }
        ]
    }]
});


describe('The line chart', () => {
    it('should generate one line when there are no breakdowns selected', (done) => {
        const dimensionalData = new DimensionalData(uniques.desktop.items);
        dimensionalData.merge(uniques.mobile.items);
        const graphModel = new GraphModel('es.wikipedia.org', 'unique-devices');
        const dimensions = Dimension.fromMetricConfig(metric);
        graphModel.dimensions = dimensions;
        graphModel.timeRange = new TimeRange(['2016-06-01', '2017-07-01']);
        graphModel.setData(dimensionalData);
        const vm = getVueComponent(LineChart, {
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
        Vue.nextTick(() => {
            expect($('.breakdownLine', vm.$el).length).toEqual(1);
            done();
        })
    });

    it('should generate an x axis', function (done) {
        const dimensionalData = new DimensionalData(uniques.desktop.items);
        dimensionalData.merge(uniques.mobile.items);
        const graphModel = new GraphModel('es.wikipedia.org', 'unique-devices');
        const dimensions = Dimension.fromMetricConfig(metric);
        graphModel.dimensions = dimensions;
        graphModel.timeRange = new TimeRange(['2016-06-01', '2017-07-01']);
        graphModel.setData(dimensionalData);
        const vm = getVueComponent(LineChart, {
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
        Vue.nextTick(() => {
            expect($('.xAxisLabel', vm.$el).length).toBeGreaterThan(0);
            done();
        })
    });
});

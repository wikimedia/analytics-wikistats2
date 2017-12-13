import Vue from 'vue'
import LineChart from '../../src/components/detail/chart/LineChart.vue'
import GraphModel from '../../src/models/GraphModel'
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
const graphModel = new GraphModel(metric);
graphModel.setData(dimensionalData);
let vm;

describe('The line chart', () => {
    beforeEach(() => {
        vm = new Vue({
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
    })
    it('should generate one line when there are no breakdowns selected', () => {
        expect($('.breakdownLine', vm.$el).length).toEqual(1);
    });

    it('should generate as many lines as breakdowns selected', () => {
        graphModel.activeBreakdown = graphModel.breakdowns[1];
        // refresh data (not ideal)
        graphModel.refreshData();

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
        expect($('.breakdownLine', vm.$el).length).toEqual(2);
    });

    it('should generate an x axis', function () {
        expect($('.xAxisLabel', vm.$el).length).toBeGreaterThan(0);
    });
});

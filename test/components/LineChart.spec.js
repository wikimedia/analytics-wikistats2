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
        on: false,
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
const graphModel = new GraphModel(metric, dimensionalData);
let vm;

describe('The line chart', () => {
    beforeEach(() => {
        vm = new Vue({
            template: '<div><test :graphModel="graphModel"></test></div>',
            components: {
                'test': LineChart
            },
            data () {
                return {
                    graphModel: graphModel
                }
            }
        }).$mount();
    })
    it('should generate one line when there are no breakdowns selected', () => {
        const lineClassName = '.statLine';
        expect($(lineClassName, vm.$el).length).toEqual(1);
    });

    it('should generate as many lines as breakdowns selected', () => {
        const breakdown = {
            on: true,
            name: 'Access site',
            breakdownName: 'access-site',
            values: [
                { name: 'Mobile Site', on: true, key: 'mobile-site' },
                { name: 'Desktop Site', on: true, key: 'desktop-site' }
            ]
        }
        graphModel.breakdowns[0] = breakdown;

        const vm = new Vue({
            template: '<div><test :graphModel="graphModel"></test></div>',
            components: {
                'test': LineChart
            },
            data () {
                return {
                    graphModel: graphModel
                }
            }
        }).$mount();
        const breakdownLineClassName = '.breakdownLine';
        expect($(breakdownLineClassName, vm.$el).length).toEqual(2);
    });

    it('should generate an x axis', function () {
        const xAxisClassName = '.xAxisLabel';
        expect($(xAxisClassName, vm.$el).length).toBeGreaterThan(0);
    });
});

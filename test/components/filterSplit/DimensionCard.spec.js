import Vue from 'vue';
import metrics from 'Src/config/metrics';
import Dimension from 'Src/models/Dimension';
import DimensionCard from 'Src/components/detail/filterSplit/DimensionCard';
import getVueComponent from '../../util/getVueComponent';

describe('The dimension card', () => {
    it('should have its split button pressed if the dimension is being split by', () => {
        const dimension = metrics['total-page-views'].breakdowns.map(d => new Dimension(d))[0];
        const vm = getVueComponent(DimensionCard, {
            template: '<div><test :dimension="dimension" :splittable="true"></test></div>',
            components: {
                'test': DimensionCard
            },
            data () {
                return {
                    dimension
                }
            }
        });
        vm.$store.state.metric ='total-page-views';
        vm.$mount();
        dimension.split();
        Vue.nextTick(() => {
            debugger;
            expect($('.button.split', vm.$el).hasClass('pressed')).toEqual(true);
        })
    });
    it('should have checkboxes check for dimension values that are visible', () => {
        const dimension = metrics['total-page-views'].breakdowns.map(d => new Dimension(d))[0];
        const vm = getVueComponent(DimensionCard, {
            template: '<div><test :dimension="dimension"></test></div>',
            components: {
                'test': DimensionCard
            },
            data () {
                return {
                    dimension
                }
            }
        });
        vm.$store.state.metric ='total-page-views';
        vm.$mount();
        dimension.enable();
        dimension.values[1].on = false;
        Vue.nextTick(() => {
            const inputs = $('.ui.checkbox.checked', vm.$el);
            expect(inputs.length).toEqual(2);
        })
    });

    it('should not show the split button if the metric is not splittable', () => {
        const dimension = metrics['total-page-views'].breakdowns.map(d => new Dimension(d))[0];
        const vm = getVueComponent(DimensionCard, {
            template: '<div><test :splittable="false" :dimension="dimension"></test></div>',
            components: {
                'test': DimensionCard
            },
            data () {
                return {
                    dimension
                }
            }
        });
        vm.$store.state.metric ='total-page-views';
        vm.$mount();
        Vue.nextTick(() => {
            expect($('.button.split', vm.$el).length).toEqual(0);
        })
    })
});
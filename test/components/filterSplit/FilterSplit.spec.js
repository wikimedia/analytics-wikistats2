import Vue from 'vue';
import metrics from 'Src/config/metrics';
import Dimension from 'Src/models/Dimension';
import FilterSplit from 'Src/components/detail/filterSplit/FilterSplit';
import getVueComponent from '../../util/getVueComponent';

const metric = 'total-page-views';

describe('The filter/split component', () => {
    it('should only show the dimension selector by default', () => {
        const vm = getVueComponent(FilterSplit, {
            template: '<div><test></test></div>',
            components: {
                'test': FilterSplit
            }
        });
        vm.$store.state.metric = metric;
        vm.$store.commit('dimensions/metric', metric);
        vm.$mount();
        const filterSplitChildren = vm.$children[0].$children;
        expect(filterSplitChildren.length).toEqual(1);
        expect(filterSplitChildren[0].$options.name).toEqual('dimension-selector-card');
    });

    it('should spawn as many dimension cards as active dimensions', () => {
        const dimensions = metrics[metric].breakdowns.map(d => new Dimension(d));
        const vm = getVueComponent(FilterSplit, {
            template: '<div><test></test></div>',
            components: {
                'test': FilterSplit
            }
        });
        vm.$store.state.metric = metric;
        vm.$store.commit('dimensions/metric', metric);
        vm.$store.dispatch('dimensions/enableDimension', dimensions[0].key);
        vm.$store.dispatch('dimensions/enableDimension', dimensions[1].key);
        vm.$mount();
        Vue.nextTick(() => {
            const filterSplitChildren = vm.$children[0].$children;
            const transitionChildren = filterSplitChildren[1].$children;
            expect(transitionChildren.length).toEqual(2);
        })
    });
});

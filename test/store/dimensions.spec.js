import store from 'Src/store/dimensions';
import Vuex from 'vuex';
import Vue from 'vue';
import getVueComponent from '../util/getVueComponent';
import WikiTimeBar from 'Src/components/detail/WikiTimeBar';
import config from 'Src/config';
import Dimension from 'Src/models/Dimension'

const metric = 'total-page-views';
const metricConfig = config.metricConfig(metric);

describe('The dimensions state store', () => {
    it('should reset dimensions if all are disabled', () => {
        const vm = getVueComponent(WikiTimeBar, {
            template: '<div><test></test></div>'
        });
        vm.$store.state.metric = metric;
        vm.$store.commit('dimensions/dimensions', Dimension.fromMetricConfig(metricConfig));
        const dimensions = vm.$store.getters['dimensions/dimensions'];
        const dimension = dimensions[0];
        const dimensionKey = dimension.key;
        vm.$store.dispatch('dimensions/enableDimension', dimensionKey);
        vm.$store.dispatch('dimensions/enableSplit', dimensionKey);
        expect(dimension.active).toEqual(true);
        expect(dimension.splitting).toEqual(true);
        vm.$store.dispatch('dimensions/disableDimension', dimensionKey);
        Vue.nextTick(() => {
            expect(dimension.active).toEqual(false);
            expect(dimension.splitting).toEqual(false);
            expect(dimensions.some(dim => dim.active)).toEqual(false);
        })
    });

    it('should split by default when the first dimension is enabled', () => {
        const vm = getVueComponent(WikiTimeBar, {
            template: '<div><test></test></div>'
        });
        vm.$store.state.metric = metric;
        vm.$store.commit('dimensions/dimensions', Dimension.fromMetricConfig(metricConfig));
        const dimensions = vm.$store.getters['dimensions/dimensions'];
        const dimension = dimensions[0];
        vm.$store.dispatch('dimensions/enableDimension', dimension.key);
        expect(dimensions[0].splitting).toEqual(true);
    });

    it('should disable any previous split if split is changed', () => {
        const vm = getVueComponent(WikiTimeBar, {
            template: '<div><test></test></div>'
        });
        vm.$store.state.metric = metric;
        vm.$store.commit('dimensions/dimensions', Dimension.fromMetricConfig(metricConfig));
        const dimensions = vm.$store.getters['dimensions/dimensions'];
        const dimension = dimensions[0];
        const dimensionKey = dimension.key;
        // Enabling first "agent type" as the split, enabling "access method" but not splitting
        vm.$store.dispatch('dimensions/enableDimension', dimensions[0].key);
        vm.$store.dispatch('dimensions/enableDimension', dimensions[1].key);
        vm.$store.dispatch('dimensions/enableSplit', dimensions[1].key);
        // Clicking on "access method" split
        vm.$store.dispatch('dimensions/enableSplit', dimensions[0].key);
        Vue.nextTick(() => {
            expect(dimensions[1].splitting).toEqual(false);
            expect(dimensions[0].splitting).toEqual(true);
        })
    });

    it('should disable the split for a disabled dimension', () => {
        const vm = getVueComponent(WikiTimeBar, {
            template: '<div><test></test></div>'
        });
        vm.$store.state.metric = metric;
        vm.$store.commit('dimensions/dimensions', Dimension.fromMetricConfig(metricConfig));
        const dimensions = vm.$store.getters['dimensions/dimensions'];
        const dimension = dimensions[0];
        const dimensionKey = dimension.key;
        vm.$store.dispatch('dimensions/enableDimension', dimensions[0].key);
        vm.$store.dispatch('dimensions/enableSplit', dimensions[0].key);
        vm.$store.dispatch('dimensions/disableDimension', dimensions[0].key);
        expect(dimensions[0].splitting).toEqual(false);
        expect(dimensions.some(dim => dim.active)).toEqual(false);
    });

    it('should disable the dimension if all values are disabled', () => {
        const vm = getVueComponent(WikiTimeBar, {
            template: '<div><test></test></div>'
        });
        vm.$store.state.metric = metric;
        vm.$store.commit('dimensions/dimensions', Dimension.fromMetricConfig(metricConfig));
        const dimensions = vm.$store.getters['dimensions/dimensions'];
        const dimension = dimensions[0];
        const dimensionKey = dimension.key;
        vm.$store.dispatch('dimensions/enableDimension', dimensions[0].key);
        expect(dimensions[0].active).toEqual(true);
        dimension.values.forEach(v =>
            vm.$store.dispatch('dimensions/disableDimensionValue', {
                dimensionKey: dimension.key,
                filterValueKey: v.key
            }))
        expect(dimensions[0].active).toEqual(false);
    });

    it('should all values enabled if all values are disabled and then dimension is enabled again', () => {
        const vm = getVueComponent(WikiTimeBar, {
            template: '<div><test></test></div>'
        });
        vm.$store.state.metric = metric;
        vm.$store.commit('dimensions/dimensions', Dimension.fromMetricConfig(metricConfig));
        const dimensions = vm.$store.getters['dimensions/dimensions'];
        const dimension = dimensions[0];
        const dimensionKey = dimension.key;
        vm.$store.dispatch('dimensions/enableDimension', dimensions[0].key);
        expect(dimensions[0].splitting).toEqual(true);
        dimension.values.forEach(v =>
            vm.$store.dispatch('dimensions/disableDimensionValue', {
                dimensionKey: dimension.key,
                filterValueKey: v.key
            }))
        vm.$store.dispatch('dimensions/enableDimension', dimensions[0].key);
        expect(dimensions[0].values.some(v => v.on)).toEqual(true);
    });

})
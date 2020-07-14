import config from 'Src/config';
import utils from '../utils';
import Dimension from 'Src/models/Dimension';
import Vue from 'vue';

const state = {
    dimensions: []
};

const mutations = {
    metric(state, metric) {
        const metricConfig = config.metricConfig(metric);
        const metricDimensions = utils.cloneDeep(metricConfig.breakdowns || []);
        state.dimensions = metricDimensions.map(dimension => new Dimension(dimension));
    },
    dimensions(state, dimensions) {
        state.dimensions = dimensions;
    },
    enable(state, {key}) {
        const dimension = state.dimensions.find(d => d.key === key);
        Vue.set(dimension, 'active', true);
    },
    disable(state, {key}) {
        const dimension = state.dimensions.find(d => d.key === key);
        Vue.set(dimension, 'active', false);
    },
    enableSplit(state, {key}) {
        const dimension = state.dimensions.find(d => d.key === key);
        Vue.set(dimension, 'splitting', true);
    },
    disableSplit(state, {key}) {
        const dimension = state.dimensions.find(d => d.key === key);
        if(!dimension) return;
        Vue.set(dimension, 'splitting', false);
    },
    disableDimensionValue(state, {dimensionKey, filterValueKey}) {
        const dimension = state.dimensions.find(d => d.key === dimensionKey);
        dimension.values.find(v => v.key === filterValueKey).on = false;
    },
    enableDimensionValue(state, {dimensionKey, filterValueKey}) {
        const dimension = state.dimensions.find(d => d.key === dimensionKey);
        dimension.values.find(v => v.key === filterValueKey).on = true;
    },
};

const actions = {
    disableDimension ({commit, getters}, key) {
        commit('disable', {key});
        const dimension = getters.dimension(key);
        if (dimension.splitting) commit('disableSplit', {key});
    },
    enableDimension ({getters, commit, dispatch}, key) {
        commit('enable', {key});
        const dimension = getters.dimension(key);
        dimension.values.forEach(v =>
            dispatch('enableDimensionValue', {
                dimensionKey: key,
                filterValueKey: v.key
            })
        );
        const dimensions = getters.dimensions;
        const splittable = config.metricConfig(this.state.metric).structure !== 'top';
        if (splittable && !dimensions.some(d => d.splitting)) {
            commit('enableSplit', {key});
        }
    },
    enableSplit ({getters, commit}, key) {
        getters.dimensions.forEach(d => commit('disableSplit', {key: d.key}));
        commit('enableSplit', {key});
    },
    disableSplit ({commit}, key) {
        commit('disableSplit', {key});
    },
    disableDimensionValue({getters, commit, dispatch}, {dimensionKey, filterValueKey}) {
        commit('disableDimensionValue', {dimensionKey, filterValueKey});
        const dimension = getters.dimension(dimensionKey);
        if(!dimension.values.some(value => value.on)) {
            dispatch('disableDimension', dimensionKey);
        }
    },
    enableDimensionValue({getters, commit}, {dimensionKey, filterValueKey}) {
        commit('enableDimensionValue', {dimensionKey, filterValueKey});
    }
};

const getters = {
    dimension: (state) => (key) => {
        return state.dimensions.find(d => d.key === key);
    },
    dimensions (state) {
        return state.dimensions.filter(d => !d.locked);
    },
    activeDimensions (state) {
        return state.dimensions.filter(d => d.active);
    },
    splittingDimension (state, getters) {
        let splitting = state.dimensions.find(d => d.splitting);
        if (!splitting) return getters.totalDimension;
        return splitting;
    },
    totalDimension (state) {
        return new Dimension({
            total: true,
            name: 'Total',
            // this undefined is meaningful as a second parameter to DimensionalData.breakdown
            key: 'total',
            values: [
                { name: 'total', on: true, key: 'total' },
            ],
        });
    },
    activeSplitValues (state, getters) {
        const splittingDimension = getters.splittingDimension;
        if (typeof splittingDimension === 'undefined') return ['total'];
        return splittingDimension.values.filter(v => v.on).map(d => d.key);
    },
    colorForDimensionValue: (state, getters) => (key, area) => {
        const splittingDimension = getters.splittingDimension;
        return key === 'total' ?
            config.colors[area][config.colors[area].length - 1] :
            config.qualitativeScale[splittingDimension.values.length][splittingDimension.values.indexOf(splittingDimension.values.find(value => value.key === key))];
    }
}

const dimensionStore = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}

export default dimensionStore;
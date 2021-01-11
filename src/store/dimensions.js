import config from 'Src/config';
import utils from '../utils';
import Dimension from 'Src/models/Dimension';
import Vue from 'vue';

const state = {
    dimensions: []
};

const mutations = {
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
    setDimensions ({commit, getters, dispatch}, dimensions) {
        if (!dimensions) return;
        commit('dimensions', dimensions);
        const nonLockedDimensions = dimensions.filter(d => !d.locked);
        if (nonLockedDimensions.length === 1) {
            commit('enable', {key: nonLockedDimensions[0].key});
        }
        dimensions.forEach(dimension => {
            if (!dimension.allValue) {
                commit('enable', {key: dimension.key});
                const filterValueKey = dimension.values[0].key;
                dispatch('disableAllValuesExcept', {dimensionKey: dimension.key, filterValueKey});
            }
        })
    },
    setMetric ({dispatch}, key) {
        const metricConfig = config.metricConfig(key);
        const metricDimensions = Dimension.fromMetricConfig(metricConfig);
        dispatch('setDimensions', metricDimensions);
    },
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
        const noOtherSplit = !dimensions.some(d => d.splitting);
        if (splittable && noOtherSplit) {
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
    enableDimensionValue({getters, commit, dispatch}, {dimensionKey, filterValueKey}) {
        const dimension = getters.dimension(dimensionKey);
        // When there's no "all-value" (meaning, dimension is not additive), we can't have
        // more than one dimension value active, so the value selectors turn into radio buttons.
        if(!dimension.allValue) {
            dispatch('disableAllValuesExcept', {dimensionKey, filterValueKey});
        } else {
            commit('enableDimensionValue', {dimensionKey, filterValueKey});
        }
    },
    disableAllValuesExcept({getters, commit}, {dimensionKey, filterValueKey}) {
        const dimension = getters.dimension(dimensionKey);
        commit('enableDimensionValue', {dimensionKey, filterValueKey});
        dimension.values.filter(value => value.key !== filterValueKey).forEach(value => {
            commit('disableDimensionValue', {dimensionKey, filterValueKey: value.key});
        });
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
    },
    filteredInfo (state, getters) {
        const dimensions = getters.dimensions;
        const info = {};
        dimensions
            .filter(dimension => dimension.active)
            .filter(dimension => dimension.values.some((v) => v.on === false))
            .forEach(dimension => {
                info[dimension.key] = dimension.values
                    .filter(value => value.on)
                    .map(value => value.key);
            });
        return info;
    },
    filtering (state, getters) {
        const filteredInfo = getters.filteredInfo;
        return Object.keys(filteredInfo).length > 0;
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
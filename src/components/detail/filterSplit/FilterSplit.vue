<template>
    <div class="filtersplit">
        <dimension-selector-card v-if="dimensions.length > 1"
            :dimensions="dimensions"
        />
        <transition-group v-if="activeDimensions.length > 0" name="cardfade" tag="div">
            <dimension-card
                class="cardfade-item"
                v-for="dimension in activeDimensions"
                :key="dimension.key"
                :dimension="dimension"
                :splittable="dimensionIsSplittable"
            />
        </transition-group>
    </div>
</template>
<script type="text/javascript">
    import Vue from 'vue';
    import DimensionCard from './DimensionCard';
    import DimensionSelectorCard from './DimensionSelectorCard';
    import { mapGetters, mapActions, mapState } from 'vuex';
    import config from 'Src/config';
    export default {
        name: 'filter-split',
        components: {
            DimensionCard,
            DimensionSelectorCard
        },
        computed: Object.assign(
            mapState(['metric']),
            mapGetters('dimensions', ['dimensions']), {
            activeDimensions () {
                return this.dimensions.filter(d => d.active);
            },
            dimensionIsSplittable () {
                return config.metricConfig(this.metric).structure !== 'top'
            }
        }),
        methods: mapActions('dimensions', [
            'disableDimension',
            'enableDimension',
            'enableSplit',
            'disableSplit',
        ])
    };
</script>
<style type="text/css">
    .cardfade-item {
        transition: all .3s ease;
    }
    .cardfade-enter {
        opacity: 0;
        transform: translateX(-100px);
    }
    .cardfade-leave-to {
        opacity: 0;
        transform: translateX(100px);
    }
    .cardfade-leave-active {
        position: absolute;
        max-width: 220px;
    }
    .cardfade-leave, .cardfade-enter-to {
        opacity: 1;
        transform: translateX(0);
    }
</style>

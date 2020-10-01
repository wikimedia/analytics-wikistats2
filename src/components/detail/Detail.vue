<template>
<div>
    <section class="detail container" :class="{ area, fullscreen }">
        <detail-sidebar
            v-if="!compact && !fullscreen"
            :otherMetrics="otherMetrics"
            :graphModel="graphModel"
        />
        <graph-panel
            v-if="graphModel && graphModel.graphData"
            :granularity="granularity"
            :graphModel="graphModel"
            :annotationsLink="annotationsLink"
            :overlayMessage="overlayMessage"
        />
    </section>
    <transition name="filter-modal-transition">
        <filter-split-modal v-if="dimensionsModalEnabled" class="filtersplitmodal" />
    </transition>
    <time-selector-tooltip :graphModel="graphModel" v-if="!mobile && selectingTime"/>
</div>
</template>

<script>

import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';

import StatusOverlay from '../StatusOverlay';
import GraphPanel from './GraphPanel';
import DetailSidebar from './DetailSidebar';
import MetricsDropdown from '../MetricsDropdown';
import TimeSelectorTooltip from '../TimeSelector/TimeSelectorTooltip';

import config from '../../config';
import utils from '../../utils';

import GraphModel from 'Src/models/GraphModel';
import TimeRange from 'Src/models/TimeRange';
import FilterSplitModal from './filterSplit/FilterSplitModal'

import titleMixin from '../../mixins/title-mixin.js';
import dateFormat from 'dateformat';

export default {
    name: 'detail',
    components: {
        GraphPanel,
        DetailSidebar,
        MetricsDropdown,
        FilterSplitModal,
        TimeSelectorTooltip,
    },

    mixins: [titleMixin],

    data () {
        return {
            graphModel: null,

            areasWithMetrics: config.areasWithMetrics,

            defaultMetrics: {
                contributing: 'active-editors',
                reading: 'total-pageviews',
                content: 'total-articles',
            },
        };
    },

    computed: Object.assign(
        mapState([
            'area',
            'metric',
            'project',
            'selectingTime'
        ]),
        mapState('dimensions', [
            'dimensions'
        ]),
        mapState('detail', [
            'fullscreen',
            'breakdown',
            'timeRange',
            'granularity',
            'dimensionsModalEnabled'
        ]), {

            metricParameters () {
                return {
                    project: this.project,
                    area: this.area,
                    metric: this.metric,
                    metricConfig: config.metricConfig(this.metric),
                };
            },

            dataParameters () {
                return {
                    breakdown: this.graphModel ? this.graphModel.activeBreakdown : null,
                };
            },

            mobile () {
                return this.$mq === 'mobile';
            },

            compact () {
                return ['mobile', 'compact'].indexOf(this.$mq) > -1;
            },
            annotationsLink () {
                return config.annotationHumanPath(this.metric);
            },
            otherMetrics () {
                return Object.keys(config.metrics)
                    .filter((m) => config.metrics[m].area === this.area)
                    .map((m) => Object.assign({}, config.metrics[m], { name: m }));
            },
            overlayMessage () {
                return this.graphModel && this.graphModel.status;
            },
        }
    ),

    watch: {
        granularity () {
            this.graphModel.setGranularity(this.granularity);
            this.$store.commit('detail/timeRange', { timeRange: this.timeRange });
        },
        overlayMessage () {
            // when we display an error or loading in full-screen, the overlay doesn't show and causes a broken interface
            if (this.overlayMessage && this.overlayMessage !== StatusOverlay.LOADING) {
                this.$store.commit('detail/fullscreen', { fullscreen: false });
            }
        },

        timeRange () {
            this.graphModel.setTimeRange(this.timeRange);
        },

        project () {
            this.graphModel.setProject(this.project);
        },

        dataParameters: {
            handler () {
                this.$store.commit('detail/breakdown', { breakdown: this.graphModel.activeBreakdown });
                this.loadData();
            },
            deep: true,
        },

        dimensions: {
            handler () {
                this.loadData();
            },
            deep: true
        }
    },

    mounted () {
        $('body').scrollTop(0);
        Vue.nextTick(() => this.buildGraphModel());
    },

    methods: {
        buildGraphModel (params) {
            const metricConfig = config.metricConfig(this.metric);
            this.graphModel = new GraphModel(this.project, this.metric);
            this.graphModel.granularity = this.granularity;
            this.graphModel.dimensions = this.dimensions;
            if (metricConfig.knownEnd) {
                const newTimeRange = new TimeRange([metricConfig.knownStart, metricConfig.knownEnd]);
                this.$store.commit('detail/timeRange', { timeRange: newTimeRange });
                this.graphModel.timeRange = newTimeRange;
            }
            if (this.timeRange.isOutOfMetricBounds(metricConfig)) {
                const newTimeRange = TimeRange.getDefaultTimeRange(metricConfig);
                this.$store.commit('detail/timeRange', { timeRange: newTimeRange });
                this.graphModel.timeRange = newTimeRange;
            }
            if (this.breakdown) {
                this.graphModel.activateBreakdownIfAvailable(this.breakdown);
            }
            this.graphModel.timeRange = this.timeRange;
        },

        loadData () {
            this.graphModel.loadData({
                annotations: true
            }, this.dimensions);
        }
    },
};
</script>

<style>
.detail.container {
    margin: 23px 0 5px 0;
    display: flex;
    align-items: stretch;
}

.fullscreen.detail.container {
    margin: 0 -30px -27px -21px;
}

.filter-modal-transition-enter-active, .filter-modal-transition-leave-active {
    transition: all .2s;
}

.filter-modal-transition-enter, .filter-modal-transition-leave-to {
    opacity: 0;
    transform: translateY(100px);
}
.filter-modal-transition-leave, .filter-modal-transition-enter-to {
    opacity: 1;
    transform: translateY(0);
}

@media(max-width: 500px) {
    .detail.container {
        margin: 0!important;
    }
}
</style>

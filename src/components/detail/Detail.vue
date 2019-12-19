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
    <div v-if="compact || fullscreen" class="container breakdowns">
        <breakdowns
            v-if="graphModel && graphModel.graphData
                  && graphModel.breakdowns
                  && graphModel.breakdowns.length > 1
                  && graphModel.breakdownAllowed()"
            :graphModel="graphModel"
        />
    </div>
</div>
</template>

<script>

import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';

import StatusOverlay from '../StatusOverlay';
import GraphPanel from './GraphPanel';
import DetailSidebar from './DetailSidebar';
import MetricsDropdown from '../MetricsDropdown';
import Breakdowns from './Breakdowns'

import config from '../../config';
import utils from '../../utils';

import GraphModel from 'Src/models/GraphModel';
import TimeRange from 'Src/models/TimeRange';

import titleMixin from '../../mixins/title-mixin.js';
import dateFormat from 'dateformat';

export default {
    name: 'detail',
    components: {
        GraphPanel,
        DetailSidebar,
        MetricsDropdown,
        Breakdowns
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
        ]),
        mapState('detail', [
            'fullscreen',
            'breakdown',
            'timeRange',
            'granularity'
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
                    .map((m) => Object.assign(config.metrics[m], { name: m }));
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
            });
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

@media(max-width: 500px) {
    .detail.container {
        margin: 0!important;
    }
    .container.breakdowns {
        padding: 1em;
    }
}
</style>

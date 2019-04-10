<template>
<div>
    <section class="detail container" :class="{ area, fullscreen }">
        <detail-sidebar
            v-if="!compact && !fullscreen"
            :otherMetrics="otherMetrics"
            :graphModel="graphModel"
        />
        <graph-panel
            :granularity="dataParameters.granularity"
            ref="graphPanel"
            :graphModel="graphModel"
            :annotationsLink="annotationsLink"
            :overlayMessage="overlayMessage"
        />
    </section>
    <div v-if="compact || fullscreen" class="container breakdowns">
        <breakdowns
            v-if="graphModel.graphData
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

import GraphModel from '../../models/GraphModel';

import titleMixin from '../../mixins/title-mixin.js';

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
            'timeRange',
            'breakdown',
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
                const getAll = this.metricParameters.metricConfig.cumulative;
                const timeRange = utils.getRequestInterval(getAll ? {name: 'All'} : this.timeRange);
                timeRange.start = utils.createDate(timeRange.start);
                timeRange.end = utils.createDate(timeRange.end);
                return {
                    timeRange: timeRange,
                    granularity: utils.getGranularity(this.timeRange),
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
        overlayMessage () {
            // when we display an error or loading in full-screen, the overlay doesn't show and causes a broken interface
            if (this.overlayMessage && this.overlayMessage !== StatusOverlay.LOADING) {
                this.$store.commit('detail/fullscreen', { fullscreen: false });
            }
        },

        metricParameters () {
            this.buildGraphModel();
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
            params = params || this.metricParameters;

            this.graphModel = new GraphModel(params.metricConfig);

            if (this.breakdown) {
                this.graphModel.activateBreakdownIfAvailable(this.breakdown);
            }
        },

        loadData () {
            const params = Object.assign({}, this.metricParameters, this.dataParameters);
            this.graphModel.loadData({
                project: this.project,
                granularity: params.granularity,
                timeRange: params.timeRange,
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

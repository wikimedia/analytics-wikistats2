<template>
<div>
    <section class="detail container" :class="{ area, fullscreen }">
        <detail-sidebar
            v-if="!compact && !fullscreen"
            :otherMetrics="otherMetrics"
            :graphModel="graphModel"
            :disableBreakdowns="overlayMessage"
        />
        <graph-panel
            :granularity="dataParameters.granularity"
            ref="graphPanel"
            :graphModel="graphModel"
            :overlayMessage="overlayMessage"
        />
    </section>
    <div v-if="compact || fullscreen" class="container breakdowns">
        <breakdowns
            v-if="graphModel
                  && graphModel.breakdowns
                  && graphModel.breakdowns.length > 1"
            :graphModel="graphModel"
            :disableBreakdowns="overlayMessage"
        />
    </div>
</div>
</template>

<script>

import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';

import StatusOverlay from '../StatusOverlay';
import MetricsModal from './MetricsModal';
import GraphPanel from './GraphPanel';
import DetailSidebar from './DetailSidebar';
import TimeRangeSelector from '../TimeRangeSelector';
import MetricsDropdown from '../MetricsDropdown';
import Breakdowns from './Breakdowns'

import config from '../../config';
import utils from '../../utils';

import GraphModel from '../../models/GraphModel';
import AQS from '../../apis/aqs';

import titleMixin from '../../mixins/title-mixin.js';

export default {
    name: 'detail',
    components: {
        MetricsModal,
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

            otherMetrics: [],

            overlayMessage: null,
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
                return {
                    timeRange: this.timeRange,
                    granularity: utils.getGranularity(this.timeRange.start, this.timeRange.end),
                    breakdown: this.graphModel ? this.graphModel.activeBreakdown : null,
                };
            },

            mobile () {
                return this.$mq === 'mobile';
            },

            compact () {
                return ['mobile', 'compact'].indexOf(this.$mq) > -1;
            }
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
                this.$store.commit('detail/breakdown', { breakdown: this.dataParameters.breakdown });
                this.loadData();
            },
            deep: true,
        },
    },

    mounted () {
        $('body').scrollTop(0);
        this.aqsApi = new AQS();
        Vue.nextTick(() => this.buildGraphModel());
    },

    methods: {
        buildGraphModel (params) {
            params = params || this.metricParameters;

            this.graphModel = new GraphModel(params.metricConfig);

            this.otherMetrics = Object.keys(config.metrics)
                .filter((m) => config.metrics[m].area === params.area)
                .map((m) => Object.assign(config.metrics[m], { name: m }));

            if (this.breakdown) {
                this.graphModel.activateBreakdownIfAvailable(this.breakdown);
            }
        },

        loadData () {
            const params = Object.assign({}, this.metricParameters, this.dataParameters);

            if (!params.metricConfig.global && params.project === config.ALL_PROJECTS) {
                this.overlayMessage = StatusOverlay.NON_GLOBAL(params.metricConfig.fullName);
            } else {
                const defaults = params.metricConfig.defaults || {
                    unique: {},
                    common: {}
                };
                let uniqueParameters = Object.assign(
                    {},
                    defaults.unique,
                    {
                        project: [params.project]
                    },
                );
                const commonParameters = Object.assign(
                    {},
                    defaults.common,
                    {
                        start: params.timeRange.start,
                        end: params.timeRange.end,
                        granularity: params.granularity,
                        structure: params.metricConfig.structure,
                    }
                );

                if (params.metricConfig.structure === 'top') {
                    Object.assign(commonParameters, utils.getLastFullMonth(commonParameters.end));
                }

                if (params.breakdown && !params.breakdown.total) {
                    let breakdownKeys = params.breakdown.values.filter(bv => bv.on).map(bv => bv.key);

                    // in this case, the user de-selected the last value, toggle back to Total
                    if (!breakdownKeys.length) {
                        // also re-select everything otherwise this will loop
                        // to see what I mean, try deleting the next line and de-selecting all values
                        params.breakdown.values.forEach(bv => bv.on = true);
                        this.graphModel.activeBreakdown = this.graphModel.breakdowns[0];
                        return;
                    }
                    uniqueParameters[params.breakdown.breakdownName] = breakdownKeys;
                }

                let dataPromise = this.aqsApi.getData(uniqueParameters, commonParameters);
                this.overlayMessage = StatusOverlay.LOADING;

                dataPromise.catch((req, status, error) => {
                    this.overlayMessage = StatusOverlay.getMessageForStatus(req.status);
                });
                dataPromise.then(dimensionalData => {
                    this.overlayMessage = null;
                    this.graphModel.setData(dimensionalData);
                });
            }
        },
    },
};
</script>

<style>
.detail.container {
    margin: 23px 0 5px 0;
    display: flex;
    align-items: stretch;
}

.clearing.basic.segment { padding: 0; }
.xui.checkbox {
    display: block;
    margin: 10px 0;
    cursor: pointer;
}
.xui.checkbox input[type=checkbox] {
    vertical-align: middle;
    width: 18px;
    height: 18px;
    margin-right: 3px;
}
.ui.line.label {
    display: table;
    margin: 3px;
    background-color: #fefefe!important;
    border: solid 2px #cdcdcd!important;
    font-size: 13px;
    font-weight: 500;
    color: #54595d!important;
    padding: 5px 9px;
    cursor: pointer;
}
.ui.line.label.router-link-current {
    background-color: #a7a7a7!important;
    border: solid 2px #979797!important;
    font-weight: bold;
    color: #222!important;
}

.fullscreen .graph.panel {
    border-radius: 0;
}
.fullscreen.detail.container {
    margin: 0 -30px -27px -21px;
}
.right.floated.basic.fudge.segment {
    margin: 0;
    padding: 0;
}
.simple.legend {
    margin-right: 10px;
    margin-top: 5px;
    display: inline-block;
}

.add.wiki.design {
    display: none;
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

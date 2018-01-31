<template>
<section class="detail container" :class="{ area, fullscreen }">
    <detail-sidebar
        v-if="!fullscreen"
        :otherMetrics="otherMetrics"
        :graphModel="graphModel"
    />

    <graph-panel
        :granularity="dataParameters.granularity"
        ref="graphPanel"
        :graphModel="graphModel"
        :overlayMessage="overlayMessage"
        @changeTimeRange="setTimeRange"
        :fullscreen="fullscreen"
        @toggleFullscreen="toggleFullscreen"
    />
</section>
</template>

<script>

import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';

import StatusOverlay from '../StatusOverlay';
import MetricsModal from './MetricsModal';
import GraphPanel from './GraphPanel';
import DetailSidebar from './DetailSidebar';
import TimeRangeSelector from '../TimeRangeSelector';

import config from '../../config';
import utils from '../../utils';

import GraphModel from '../../models/GraphModel';
import AQS from '../../apis/aqs';

import sitematrix from '../../apis/sitematrix';
import dateformat from 'dateformat';

export default {
    name: 'detail',
    components: {
        MetricsModal,
        GraphPanel,
        DetailSidebar
    },
    data () {
        return {
            graphModel: null,

            fullscreen: false,
            areasWithMetrics: config.areasWithMetrics,

            defaultMetrics: {
                contributing: 'active-editors',
                reading: 'total-pageviews',
                content: 'total-articles',
            },

            otherMetrics: [],

            overlayMessage: null,
            range: TimeRangeSelector.getDefaultTimeRange(),
        };
    },

    computed: Object.assign(
        mapState([
            'area',
            'metric',
            'project',
        ]), {
            metricParameters () {
                return {
                    project: this.project,
                    area: this.area,
                    metric: this.metric,
                    metricConfig: config.metricData(this.metric),
                };
            },

            dataParameters () {
                return {
                    range: this.range,
                    granularity: getGranularityForRange(this.range),

                    breakdown: this.graphModel ? this.graphModel.activeBreakdown : null,
                };
            },
        }
    ),

    watch: {
        overlayMessage () {
            // when we display an error or loading in full-screen, the overlay doesn't show and causes a broken interface
            if (this.overlayMessage && this.overlayMessage !== StatusOverlay.LOADING) { this.fullscreen = false; }
        },

        metricParameters () {
            this.buildGraphModel();
        },

        dataParameters: {
            handler () {
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
        buildGraphModel () {
            const params = this.metricParameters;

            this.graphModel = new GraphModel(params.metricConfig);

            this.otherMetrics = Object.keys(config.metrics)
                .filter((m) => config.metrics[m].area === params.area)
                .map((m) => Object.assign(config.metrics[m], { name: m }));
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
                        start: params.range[0],
                        end: params.range[1],
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

        changeChart (t) {
            this.chartType = t.chart;
            this.chartIcon = t.icon;
        },

        toggleFullscreen () {
            this.fullscreen = !this.fullscreen;
            Vue.nextTick(() => this.$refs.graphPanel.redrawGraph());
        },

        setTimeRange (newRange) {
            this.range = newRange;
        }
    },
};

function getGranularityForRange (range) {
    const start = utils.createDate(range[0]);
    const end = utils.createDate(range[1]);
    const millisecondsInSixMonths = 15552e6;
    return end - start > millisecondsInSixMonths ? 'monthly' : 'daily';

}
</script>

<style>
.detail.container {
    margin: 23px 0 5px 0;
    display: flex;
    align-items: stretch;
}
.panel {
    padding: 25px 18px 18px 18px;
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
    color: #9b9b9b!important;
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
</style>

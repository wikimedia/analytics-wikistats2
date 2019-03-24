<template>
<section class="graph panel">
    <div v-if="graphModel && mobile" class="metrics">
        <metrics-dropdown :metric="graphModel.config" :granularity="granularity"/>
    </div>
    <div v-if="mobile" class="metrics wikis">
        <wiki-selector :single="false"></wiki-selector>
    </div>
    <div class="ui clearing basic segment graph" v-if="graphModel">
        <div>
            <h2 v-if="!mobile" class="ui left floated header">
                <a class='metric link' :href="graphModel.config.infoUrl" target="_blank"
                   v-hint:raw="graphModel.config.tooltip">
                    {{graphModel.config.fullName || 'No data yet... '}}
                </a>
                <span v-if="graphModel && graphModel.graphData" class="subdued granularity">{{month || granularity}}</span>
            </h2>

            <div class="ui right floated basic fudge segment">
                <simple-legend
                    v-if="!mobile && activeBreakdown && chartComponent !== 'table-chart' && chartComponent !== 'map-chart'"
                    class="simple legend"
                    :breakdown="activeBreakdown">
                </simple-legend>
                <div v-if="!mobile" class="ui right floated icon buttons">


                    <button @click="download" class="ui icon button" v-hint:help="'download'">
                        <i class="download icon"></i>
                    </button>
                    <div class="ui icon button simple dropdown" v-hint:help="'permalink'">
                        <i class="chain icon"></i>
                        <div class="menu permalink">
                            <div class="ui right labeled input">
                                <input type="text" :value="permalinkURL" readonly ref="permalinkText">
                                <button @click="copyPermalink" class="ui icon button" v-hint:help="'copy'">
                                    <i class="copy icon"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="ui simple dropdown right labeled icon button"
                         v-hint:help="'change-chart'">
                        <i class="ui dropdown icon"/>
                        <span>
                            <i :class="chartIcon" class="chart icon"></i>
                        </span>
                        <div class="menu">
                            <div class="item"
                                 v-for="t in chartTypes" :key="t.chart"
                                 @click="changeChart(t)">
                                 <i :class="t.icon" class="chart icon"></i>
                                 {{t.chart | capitalize}}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            <component
                ref="graph"
                v-if="graphModel"
                :is="chartComponent"
                :graphModel="graphModel">
            </component>
            <div class="ui center aligned basic segment">
                <h5 v-if="graphModel.config.structure === 'timeseries'">
                    {{graphModel.getAggregateLabel()}}:
                    {{ aggregate | bytesOrKmb(unit)}}
                    <arrow-icon :value="changeOverRange"></arrow-icon>
                    <span v-if="changeOverRange">
                        {{changeOverRange}}% over this time range.
                    </span>
                    <span v-else>
                        % change cannot be calculated over this time range.
                    </span>
                </h5>
                <p>{{graphModel.config.description}}.
                    <a class="metric link" :href="graphModel.config.infoUrl" target="_blank"
                       v-hint:raw="graphModel.config.tooltip">
                        More info about this metric.
                    </a>
                </p>
                <p>
                    You can
                    <a class="metric link" :href="annotationsLink" target="_blank"
                       v-hint:help="'annotations'">
                        see or add annotations for this data on this wiki article.
                    </a>
                </p>
                <p>
                    <a v-if="wikistats1URL" class="metric link wikistats1" :href="wikistats1URL" target="_blank" v-hint:wikistats1Metric.s>
                        <img class="wikimedia-logo" src="../../assets/Wikimedia-logo.svg" alt="wikimedia-logo" /> This metric is filtered to match its Wikistats 1 counterpart.
                    </a>
                </p>
            </div>
        </div>
        <div v-if="!['list', 'map'].includes(graphModel.config.type)" class="ui center aligned subdued basic segment">
            <time-range-selector
                :frozen="graphModel.config.frozen">
            </time-range-selector>
        </div>
        <status-overlay v-if="overlayMessage" :overlayMessage="overlayMessage"/>
    </div>
    <div class="ui right floated icon button"
         v-if="!mobile && !overlayMessage"
         @click="toggleFullscreen"
         v-hint:help="fullscreen ? 'minimize' : 'maximize'">

        <i class="ui icon" :class="{expand: !fullscreen, compress: fullscreen}"/>
    </div>
</section>
</template>

<script>
import WikiSelector from '../WikiSelector'
import MetricsDropdown from '../MetricsDropdown'
import ArrowIcon from '../ArrowIcon';
import TimeRangeSelector from '../TimeRangeSelector';
import SimpleLegend from './SimpleLegend';
import BarChart from './chart/BarChart';
import LineChart from './chart/LineChart';
import TableChart from './chart/TableChart';
import EmptyChart from './chart/EmptyChart';
import MapChart from './chart/MapChart';
import StatusOverlay from '../StatusOverlay';
import config from '../../config';
import utils from '../../utils';
import detailUtils from '../../router/urls/detail';
import *  as d3Formatter from 'd3-dsv';
import _ from 'lodash';
import { mapState } from 'vuex';
import Vue from 'vue';

export default {
    name: 'graph-panel',

    components: {
        ArrowIcon,
        TimeRangeSelector,
        SimpleLegend,
        BarChart,
        LineChart,
        TableChart,
        MapChart,
        EmptyChart,
        StatusOverlay,
        MetricsDropdown,
        WikiSelector
    },

    props: ['graphModel', 'overlayMessage', 'granularity', 'annotations', 'annotationsLink'],

    computed: Object.assign(
        mapState(['detail']),
        mapState('detail', [
            'fullscreen',
            'chartType',
            'timeRange'
        ]), {
            month: function () {
                if (this.graphModel.config.structure == 'top' && this.lastMonth) {
                    return this.$options.filters.getMonthLabel(this.lastMonth, config.months);
                }
            },
            chartTypes: function () {
                return !this.graphModel ? [] : config.getChartTypes(this.graphModel.config);
            },
            chartIcon: function () {
                return config.availableChartTypes[this.chartType].icon;
            },
            chartComponent: function () {
                return this.chartType  + '-chart';
            },
            aggregate: function () {
                return this.graphModel && this.graphModel.getAggregate();
            },
            changeOverRange: function () {
                return this.graphModel.getChangeOverRange();
            },
            activeBreakdown: function () {
                return this.graphModel.activeBreakdown;
            },
            unit: function(){
                if (this.graphModel.config.unit ){
                    return this.graphModel.config.unit;
                }
            },
            lastMonth: function(){
                // graphModel might be empty when passed from parent component, careful
                if (this.graphModel && this.graphModel.graphData.length > 0){
                    return _.last(this.graphModel.graphData).month;
                }
            },
            mobile: function () {
                return this.$mq === 'mobile';
            },
            permalinkURL: function () {
                if (this.graphModel.graphData.length > 0) {
                    const specificDetail = Object.assign({}, this.detail);
                    const startDate = new Date(this.graphModel.graphData[0].month);
                    const endDate = new Date(this.graphModel.graphData[this.graphModel.graphData.length - 1].month);
                    if (utils.getGranularity(this.timeRange) === 'monthly') {
                        endDate.setUTCMonth(endDate.getUTCMonth() + 1);
                    }
                    specificDetail.timeRange = {start: startDate, end: endDate};
                    const permalink = window.location.href;
                    const specificDetailString = detailUtils.writeToURL(specificDetail);
                    return permalink.slice(0, permalink.lastIndexOf('/') + 1) + specificDetailString;
                }
            },
            wikistats1URL: function () {
                return this.graphModel.config.wikistats1URL;
            },
        }
    ),

    watch: {
        'graphModel.graphData' () {
            if (this.graphModel.graphData.length &&
                this.graphModel.config.type === 'time') {

                const adjustedGraphData = utils.adjustGraphData(this.graphModel.graphData, this.timeRange.name);

                if (adjustedGraphData.length < this.graphModel.graphData.length) {

                    this.graphModel.graphData = adjustedGraphData;
                }
            }
        },
    },

    methods: {
        // PUBLIC: used by parent components
        redrawGraph () {
            if (this.$refs.graph && this.$refs.graph.redraw) {
                this.$refs.graph.redraw();
            }
        },
        changeChart (t) {
            this.$store.commit('detail/chartType', {chartType: t.chart});
        },
        toggleFullscreen () {
            this.$store.commit('detail/fullscreen', { fullscreen: !this.fullscreen });
            Vue.nextTick(() => this.redrawGraph());
        },
        download () {
            let csvData = d3Formatter.csvFormat(this.graphModel.downloadData());
            let a = window.document.createElement('a');
            a.href = window.URL.createObjectURL(new Blob([csvData], {type: 'text/csv'}));
            a.download = this.graphModel.config.name + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        copyPermalink () {
            this.$refs.permalinkText.select();
            document.execCommand("copy");
        },
    }
}
</script>

<style>
.clearing.basic.segment { padding: 0; }

.fullscreen .graph.panel {
    border-radius: 0;
}
.right.floated.basic.fudge.segment {
    margin: 0;
    padding: 0;
}
.metrics {
    padding: 1em;
    background: #d8d8d8;
}
.ui.clearing.basic.segment.graph {
    padding: 25px 18px 18px 18px;
}
.graph.panel {
    background-color: #FFFFFF;
    flex: 1;
    border-radius: 0 10px 10px 0;
    padding-bottom: 8px;
}

.graph.panel h2.header {
    margin-left: 10px;
    font-size: 20px;
    font-weight: 500;
}
.graph.panel h2.header .subdued {
    margin-left: 4px;
    font-size: 18px;
    font-weight: 300;
}
.graph.panel .ui.right.floated.buttons {
    border: solid 1px #d4d4d5;
    border-radius: 4px;
}
.graph.panel .ui.right.floated.buttons .button {
    border-right: solid 1px #d4d4d5;
}
.graph.panel .ui.right.floated.buttons .button:last-child {
    border-right: none;
}

.graph.panel p {
    margin: 0;
}

.granularity {
    text-transform: capitalize;
    font-style: italic;
}

.metric.link{
    color: #000;
    text-decoration: none;
    border-bottom: 1px dashed black;
}
.metric.link:hover {
    color: #6289D8;
}

@media(max-width: 450px) {
    .ui.clearing.basic.segment.graph {
        padding-top: 0;
        margin-top: 0;
    }
    .ui.icon.input{
        width: calc(100vw - 3em);
    }
    .ui.buttons > .ui.button {
        padding: 10px;
    }
    .wikis {
        background: #fff;
    }
}

.permalink {
    width: 300px !important;
    margin-left: -260px !important;
}
.permalink .ui.right.labeled.input {
    margin: 10px !important;
}
.permalink input {
    text-overflow: ellipsis !important;
    overflow: hidden !important;
    white-space: nowrap !important;
}
.permalink i {
    line-height: 6px;
}

g.annotation-note {
}
g.annotation g.annotation-note, g.annotation g.annotation-connector {
    visibility: hidden;
}
g.annotation:hover g.annotation-note, g.annotation:hover g.annotation-connector {
    visibility: visible;
}
g.annotation .annotation-note-bg {
    fill-opacity: 1;
    fill: #efefff;
}

.simple.legend {
    margin-right: 10px;
    margin-top: 5px;
    display: inline-block;
}
.metric.link.wikistats1 {
    margin-left: 10px;
    display: inline;
}
.metric.link.wikistats1 img {
    width: 20px;
}
</style>

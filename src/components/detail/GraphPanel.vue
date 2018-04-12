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
                   title="Click through to get a more detailed definition of this metric on the Research wiki">
                    {{graphModel.config.fullName || 'No data yet... '}}
                </a>
                <span v-if="graphModel && graphModel.graphData" class="subdued granularity">{{month || granularity}}</span>
            </h2>

            <div class="ui right floated basic fudge segment">
                <simple-legend
                    v-if="!mobile && activeBreakdown && chartComponent !== 'table-chart'"
                    class="simple legend"
                    :breakdown="activeBreakdown">
                </simple-legend>
                <div v-if="!mobile" class="ui right floated icon buttons">

                    <button @click="download" class="ui icon button" title="Download">
                        <i class="download icon"></i>
                    </button>
                    <div class="ui simple dropdown right labeled icon button"
                         title="Change Chart">
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
                :graphModel="graphModel"
                :data="graphModel.graphData">
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
                    <a class='metric link' :href="graphModel.config.infoUrl" target="_blank"
                       title="Click through to get a more detailed definition of this metric on the Research wiki">
                        More info about this metric.
                    </a>
                </p>
            </div>
        </div>
        <div v-if="!['list', 'map'].includes(graphModel.config.type)" class="ui center aligned subdued basic segment">
            <time-range-selector
                v-on:changeTimeRange='changeTimeRange'
                :lastMonth ='lastMonth'></time-range-selector>
        </div>
        <status-overlay v-if="overlayMessage" :overlayMessage="overlayMessage"/>
    </div>
    <div class="ui right floated icon button"
         v-if="!mobile && !overlayMessage"
        @click="toggleFullscreen"
        :title="fullscreen ? 'minimize the graph and show controls' : 'maximize the graph and hide controls'">

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
import *  as d3Formatter from 'd3-dsv';
import _ from 'lodash';

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

    props: ['fullscreen', 'graphModel', 'overlayMessage', 'granularity'],
    data () {
        return {
            chartType: 'empty',
            availableChartTypes: {
                empty   : { chart: 'empty', icon: 'question' },
                bar     : { chart: 'bar', icon: 'bar' },
                line    : { chart: 'line', icon: 'line' },
                map     : { chart: 'map', icon: 'globe' },
                table   : { chart: 'table', icon: 'table' },
            }
        }
    },
    computed: {
        month: function () {
            if (this.graphModel.config.structure == 'top' && this.lastMonth) {
                return this.$options.filters.getMonthLabel(this.lastMonth, config.months);
            }
        },
        chartTypes: function () {
            return !this.graphModel ? [] : {
                map: ['map', 'table'],
                bars: ['bar', 'table'],
                lines: ['line', 'table'],
                list: ['table'],
            }[this.graphModel.config.type].map(k => this.availableChartTypes[k]);
        },
        chartIcon: function () {
            return this.availableChartTypes[this.chartType].icon;
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
        }
    },

    watch: {
        chartTypes () {
            if (this.chartTypes.length) {
                this.changeChart(this.chartTypes[0]);
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
            this.chartType = t.chart;
        },
        changeTimeRange (range) {
            this.$emit('changeTimeRange', range);
        },
        toggleFullscreen () {
            this.$emit('toggleFullscreen');
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
    }
}
</script>

<style>
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
    color: #777;
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
</style>

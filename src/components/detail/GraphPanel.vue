<template>
<section class="graph panel">
    <div class="ui clearing basic segment" v-if="graphModel">
        <div>
            <h2 class="ui left floated header">
                <a class='metric link' :href="graphModel.config.infoUrl" target="_blank"
                   title="Click through to get a more detailed definition of this metric on the Research wiki">
                    {{graphModel.config.fullName || 'No data yet... '}}
                </a>
                <span class="subdued granularity">{{granularity}}</span>
            </h2>

            <div class="ui right floated basic fudge segment">
                <simple-legend
                    v-if="activeBreakdown && chartComponent !== 'table-chart'"
                    class="simple legend"
                    :breakdown="activeBreakdown">
                </simple-legend>
                <div class="ui right floated icon buttons">

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
                                 {{t.chart}}
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
            <div class="ui center aligned basic segment" v-if="graphModel.config.type !== 'list'">
                <h5>
                    {{graphModel.getAggregateLabel()}}:
                    {{graphModel.formatNumberForMetric(aggregate)}} {{graphModel.config.fullName}}
                    <arrow-icon :value="changeOverRange"></arrow-icon>
                    {{changeOverRange}}% over this time range.
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
            <time-range-selector v-on:changeTimeRange='changeTimeRange'></time-range-selector>
        </div>
        <status-overlay v-if="overlayMessage" :overlayMessage="overlayMessage"/>
    </div>
    <div class="ui right floated icon button"
         v-if="!overlayMessage"
        @click="toggleFullscreen"
        :title="fullscreen ? 'minimize the graph and show controls' : 'maximize the graph and hide controls'">

        <i class="ui icon" :class="{expand: !fullscreen, compress: fullscreen}"/>
    </div>
</section>
</template>

<script>
import ArrowIcon from '../ArrowIcon';
import TimeRangeSelector from '../TimeRangeSelector';
import SimpleLegend from './SimpleLegend';
import BarChart from './chart/BarChart';
import LineChart from './chart/LineChart';
import TableChart from './chart/TableChart';
import EmptyChart from './chart/EmptyChart';
import StatusOverlay from '../StatusOverlay';
import *  as d3Formatter from 'd3-dsv';

export default {
    name: 'graph-panel',
    components: {
        ArrowIcon,
        TimeRangeSelector,
        SimpleLegend,
        BarChart,
        LineChart,
        TableChart,
        EmptyChart,
        StatusOverlay
    },
    props: ['fullscreen', 'graphModel', 'overlayMessage', 'granularity'],
    computed: {
        chartTypes: function () {
            return this.getChartTypes();
        },
        chartIcon: function () {
            return this.chartComponent.replace('-chart', '');
        },
        chartComponent: function () {
            if (this.chartType) return this.chartType + '-chart';
            let chartTypes = this.getChartTypes();
            return (chartTypes[0].chart || 'empty') + '-chart';
        },
        aggregate: function () {
            return this.graphModel && this.graphModel.getAggregate();
        },
        changeOverRange: function () {
            const data = this.graphModel.getAggregatedValues();
            return ((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(2);
        },
        activeBreakdown: function () {
            return this.graphModel.activeBreakdown;
        },
    },
    data () {
        return {
            chartType: null,
            availableChartTypes: [
                { chart: 'bar', icon: 'bar' },
                { chart: 'line', icon: 'line' },
                //{ chart: 'map', icon: 'globe' },
                { chart: 'table', icon: 'table' },
            ]
        }
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
        getChartTypes () {
            return this.availableChartTypes.filter((c) => {
                if (!this.graphModel) { return false; }
                if (c.chart === 'table') return true;
                if (this.graphModel.config.type === 'bars') { return c.chart !== 'line'; }
                if (this.graphModel.config.type === 'lines') { return c.chart === 'line'; }
            });
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
        }
    }
}
</script>

<style>
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
</style>

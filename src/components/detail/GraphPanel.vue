<template>
<section class="graph panel">
    <div class="ui clearing basic segment">
        <h2 class="ui left floated header">
            {{metricData.fullName || 'No data yet... '}}
            <span class="subdued">{{wiki.title}}</span>
        </h2>

        <div class="ui right floated basic fudge segment">
            <simple-legend v-if="chartType === 'bar'" class="simple legend" :data="metricData"></simple-legend>
            <div class="ui right floated icon buttons">

                <button class="ui icon button" title="Download">
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
            v-if="graphModel"
            :is="chartComponent"
            :metricData="metricData"
            :graphModel="graphModel"
            :breakdown="breakdown">
        </component>
        <div class="ui center aligned basic segment" v-if="graphModel && metricData.type !== 'list'">
            <time-range-selector v-on:changeTimeRange='changeTimeRange'></time-range-selector>
            <h5>
                Total: {{total | kmb}} {{metricData.fullName}} <arrow-icon :value="changeOverRange"></arrow-icon> {{((changeOverRange / total) * 100).toFixed(2)}}% over this time range.
            </h5>
        </div>
        <div class="ui center aligned subdued basic segment">
            <p>* Definition of {{metric}} goes here, pulled from config or maybe dynamically from the wiki page.</p>
            <p>More descriptor text will go here assuming that it takes a few sentences to explain a term for a metric.</p>

        </div>
        <div class="ui right floated icon button" @click="toggleFullscreen">
            <i class="ui icon" :class="{expand: !fullscreen, compress: fullscreen}"/>
        </div>
    </div>
</section>
</template>

<script>
import ArrowIcon from '../ArrowIcon'
import TimeRangeSelector from '../TimeRangeSelector'
import SimpleLegend from './SimpleLegend'
import BarChart from './chart/BarChart'
import LineChart from './chart/LineChart'
import MapChart from './chart/MapChart'
import TableChart from './chart/TableChart'
import EmptyChart from './chart/EmptyChart'

export default {
    name: 'graph-panel',
    components: {
        ArrowIcon,
        TimeRangeSelector,
        SimpleLegend,
        BarChart,
        LineChart,
        MapChart,
        TableChart,
        EmptyChart
    },
    props: ['metricData', 'wiki', 'breakdowns', 'fullscreen', 'graphModel'],
    computed: {
        breakdown: function () {
            return (this.breakdowns || []).find((m) => m.on)
        },
        chartTypes: function () {
            return this.getChartTypes();
        },
        chartIcon: function () {
            return this.getChartTypes()[0].icon;
        },
        chartComponent: function () {
            if (this.chartType) return this.chartType + '-chart'
            let chartTypes = this.getChartTypes();
            return (chartTypes[0].chart || 'empty') + '-chart'
        },
        total: function () {
            return this.graphModel && this.graphModel.getTotal();
        },
        metric: function () {
            return this.$route.params.metric ?
                this.$route.params.metric : this.defaultMetrics[this.area]
        },
        changeOverRange: function () {
            const data = this.graphModel.getAggregatedValues();
            return data[data.length - 1] - data[0];
        }
    },
    data () {
        return {
            chartType: null,
            availableChartTypes: [
                { chart: 'bar', icon: 'bar' },
                { chart: 'line', icon: 'line' },
                { chart: 'map', icon: 'globe' },
                { chart: 'table', icon: 'table' },
            ]
        }
    },
    methods: {
        changeChart (t) {
            this.chartType = t.chart
        },
        changeTimeRange (range) {
            this.$emit('changeTimeRange', range);
        },
        getChartTypes () {
            return this.availableChartTypes.filter((c) => {
                if (!this.metricData) { return false; }
                if (this.metricData.type === 'bars') { return c.chart !== 'line' }
                if (this.metricData.type === 'lines') { return c.chart === 'line' }
                return c.chart === 'table'
            });
        },
        toggleFullscreen () {
            this.$emit('toggleFullscreen')
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
</style>

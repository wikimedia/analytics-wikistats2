<template>
<section class="graph panel" :class="{desktop: !mobile}" :style = "{top: scrollOffset + 'px'}">
    <div v-if="mobile" class="metrics">
        <metrics-dropdown v-if="mobile" :metric="graphModel.config" :granularity="graphModel.granularity"/>
    </div>
    <wiki-time-bar v-if="mobile" :graphModel="graphModel"/>
    <div class="ui clearing basic segment graph">
        <div>
            <h2 v-if="!mobile" class="ui left floated header">
                <a class='metric link' :href="graphModel.config.infoUrl" target="_blank"
                   v-hint:raw="graphModel.config.tooltip">
                    {{$t(`metrics-${metricId}-name`) || $t('graph_panel-no_data_yet')}}
                </a>
                <span v-if="filtering" class="filter indicator subdued" v-hint:raw="translatedFilteredInfo">Filtered</span>
            </h2>

            <div class="ui right floated basic fudge segment">
                <simple-legend
                    v-if="!mobile && splittingDimension && chartComponent !== 'table-chart' && chartComponent !== 'map-chart'"
                    class="simple legend"
                    :dimension="splittingDimension"
                    :graphModel="graphModel">
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
                                 {{$t(`charts-${t.chart}`) | capitalize}}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            <component
                :is="chartComponent"
                :graphModel="graphModel">
            </component>
            <div class="ui center aligned basic segment">
                <div class= "filtersplit button container">
                    <wiki-button v-if="mobile" @click="enableDimensionsModal">
                        Filter and split this metric
                    </wiki-button>
                </div>
                <h5 v-if="graphModel.hasAggregate()">
                    {{graphModel.getAggregateLabel()}}:
                    {{ aggregate | bytesOrKmb(unit)}}
                </h5>
                <p>{{$t(`metrics-${metricId}-description`)}}.
                    <a class="metric link" :href="graphModel.config.infoUrl" target="_blank"
                       v-hint:raw="graphModel.config.tooltip">
                        {{$t('graph_panel-more_info')}}
                    </a>
                </p>
                <i18n path="graph_panel-add_annotations_link" tag="p">
                    <a class="metric link" :href="annotationsLink" target="_blank"
                       v-hint:help="'annotations'">{{ $t('graph_panel-annotations_link_action') }}</a>
                </i18n>
                <p>
                    <a v-if="wikistats1URL" class="metric link wikistats1" :href="wikistats1URL" target="_blank" v-hint:wikistats1Metric.s>
                        <img class="wikimedia-logo" src="../../assets/Wikimedia-logo.svg" alt="wikimedia-logo" /> {{$t('graph_panel-wikistats1_counterpart')}}
                    </a>
                </p>
            </div>
        </div>
        <status-overlay v-if="overlayMessage" :overlayMessage="overlayMessage" :project="graphModel.project" :metricName="$t(`metrics-${graphModel.metricId}-name`)"/>
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
import WikiButton from '../WikiButton'
import MetricsDropdown from '../MetricsDropdown'
import ArrowIcon from '../ArrowIcon';
import WikiTimeBar from './WikiTimeBar';
import SimpleLegend from './SimpleLegend';
import BarChart from './chart/BarChart';
import LineChart from './chart/LineChart';
import TableChart from './chart/TableChart';
import FilterSplit from './filterSplit/FilterSplit';
import StatusOverlay from '../StatusOverlay';
import config from '../../config';
import utils from '../../utils';
import detailUtils from '../../router/urls/detail';
import *  as d3Formatter from 'd3-dsv';
import _ from 'lodash';
import { mapGetters, mapState } from 'vuex';
import Vue from 'vue';

import 'Src/../semantic/dist/components/transition.css';
import 'Src/../semantic/dist/components/transition';

export default {
    name: 'graph-panel',

    components: {
        ArrowIcon,
        SimpleLegend,
        BarChart,
        LineChart,
        TableChart,
        'MapChart': () => import(/* webpackChunkName: "MapChart" */'./chart/MapChart'),
        StatusOverlay,
        MetricsDropdown,
        WikiSelector,
        WikiTimeBar,
        WikiButton,
        FilterSplit,
    },

    // note: graphModel must be guaranteed by parent to be valid
    props: ['graphModel', 'overlayMessage', 'annotations', 'annotationsLink'],
    mounted () {
        this.setupScrollListener();
    },
    destroyed () {
        $(document.body).off('scroll');
    },
    data () {
        return {
            scrollOffset: 0
        }
    },

    computed: Object.assign(
        mapState(['selectingTime', 'detail']),
        mapState('detail', [
            'fullscreen',
            'chartType',
            'timeRange',
            'dimensionsModalEnabled'
        ]),
        mapGetters('dimensions', [
            'splittingDimension',
            'filteredInfo',
            'filtering',
        ]), {
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
            metricId: function () {
                return this.graphModel.metricId;
            },
            unit: function(){
                if (this.graphModel.config.unit){
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
                    const startDate = new Date(this.graphModel.graphData[0].timeRange.start);
                    const endDate = new Date(this.graphModel.graphData[this.graphModel.graphData.length - 1].timeRange.end);
                    // TODO: this should be in TimeRange but done in a separate change
                    if (this.detail.granularity === 'monthly') {
                        endDate.setUTCMonth(endDate.getUTCMonth() + 1);
                    }
                    specificDetail.timeRange = {start: startDate, end: endDate};
                    const permalink = window.location.href;
                    const specificDetailString = detailUtils.writeToURL(specificDetail);
                    return permalink.slice(0, permalink.lastIndexOf('/') + 1) + specificDetailString;
                }
            },
            wikistats1URL () {
                return this.graphModel.config.wikistats1URL;
            }
        }
    ),

    methods: {
        changeChart (t) {
            this.$store.commit('detail/chartType', {chartType: t.chart});
        },
        toggleFullscreen () {
            this.$store.commit('detail/fullscreen', { fullscreen: !this.fullscreen });
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
        enableDimensionsModal () {
            this.$store.commit('detail/dimensionsModalEnabled', {enabled:true});
        },
        setupScrollListener () {
            const boundingBox = this.$el.getBoundingClientRect()
            let initialYPos = boundingBox.y;
            let initialHeight = boundingBox.height;
            $(document.body).on('scroll', ({target}) => {
                if(this.chartType === 'table') return ;
                const scroll = target.scrollTop;
                const bbox = this.$el.getBoundingClientRect();
                const endYPos = initialYPos + bbox.height;
                // Hardcoding the language bar's height;
                const offset = Math.min(endYPos - initialHeight - 300, Math.max(0, scroll - initialYPos));
                this.scrollOffset = Math.max(0, offset);
            })
        },
        // Gets the filtered values from the state and applies i18n to them
        translatedFilteredInfo () {
            const filteredInfo = this.filteredInfo;
            return Object.keys(filteredInfo)
                .map(dimensionKey =>
                    this.$t(`metrics-${this.metricId}-breakdowns-${dimensionKey}-name`) + ': ' +
                    filteredInfo[dimensionKey]
                        .map(value =>
                            this.$t(`metrics-${this.metricId}-breakdowns-${dimensionKey}-values-${value}-name`))
                        .join(', ')
                ).join('\n');
        }
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
    padding: 1em!important;
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

.graph.panel.desktop {
    position: relative;
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

.buttons > .dropdown {
    background-color: #fff!important;
}

.graph.panel p {
    margin: 0;
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
    .graph.panel{
        overflow:hidden;
    }
    .ui.clearing.basic.segment.graph {
        padding-top: 0;
        margin-top: 0;
    }
    .ui.icon.input{
        width: 100%;
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
.right.floated.basic.fudge.segment {
    padding: 0;
    margin: 0;
}
.filter.indicator {
    font-style: italic;
}
.ui.modal.transition .filtersplit {
    padding: 20px;
}

.filtersplit.button.container {
    width: 100%;
}

.filtersplit.button.container div{
    margin-left: auto;
    margin-right: auto;
}
</style>

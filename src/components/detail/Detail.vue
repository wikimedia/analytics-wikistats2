<template>
<section class="detail container" :class="{ area, fullscreen }">
    <detail-sidebar
        v-if="!fullscreen"
        :wiki='wiki'
        :otherMetrics='otherMetrics'
        :metric='metric'
        :breakdowns='breakdowns'
        :area='area'
        @wikiSelected='wikiSelected'
    />

    <graph-panel
        :metricData='metricData'
        :wiki='wiki'
        :breakdowns='breakdowns'
        :area='area'
        :graphModel='graphModel'
        @changeTimeRange='setTimeRange'
        @toggleFullscreen='toggleFullscreen'
    />

    <metrics-modal
        :areasWithMetrics="areasWithMetrics"
        :highlightMetric="highlightMetric"
        @changeMetric="goHighlight">

    </metrics-modal>
</section>
</template>

<script>
import SimpleLegend from './SimpleLegend'
import MetricsModal from './MetricsModal'

import GraphPanel from './GraphPanel'
import DetailSidebar from './DetailSidebar'

import config from '../../apis/Configuration'
import router from '../../router/index'
import DimensionalData from '../../models/DimensionalData'
import GraphModel from '../../models/GraphModel'
import AQS from '../../apis/aqs'

export default {
    name: 'detail',
    // TODO: move to the router
    props: ['wiki'],
    components: {
        SimpleLegend,
        MetricsModal,
        GraphPanel,
        DetailSidebar
    },
    data () {
        return {
            fullscreen: false,
            areasWithMetrics: config.areasWithMetrics,
            highlightMetric: {},

            defaultMetrics: {
                contributing: 'active-editors',
                reading: 'total-pageviews',
                content: 'total-articles',
            },

            otherMetrics: [],

            metricData: {},

            breakdowns: [],

            graphModel: null
        }
    },

    computed: {
        area: function () {
            return this.$route.params ? this.$route.params.area : 'loading ...'
        },
        metric: function () {
            return this.$route.params.metric ?
                this.$route.params.metric : this.defaultMetrics[this.area]
        },

        breakdown: function () {
            return (this.breakdowns || []).find((m) => m.on)
        },

        loadDataParams: function () {
            return {
                metric: this.metric,
                range: this.metricData.range,
                wiki: this.wiki,
            }
        },
    },

    watch: {
        loadDataParams: 'loadData',
    },

    mounted () {
        $('body').scrollTop(0);
        this.loadData();
        $('.ui.metrics.modal').modal();
    },

    methods: {

        wikiSelected (wiki) {
            this.$emit('wikiSelected', wiki);
        },
        loadData () {
            this.highlightMetric = { name: this.metric, area: this.area }

            config.metricData(this.metric, this.area).then((result) => {
                this.metricData = result
                this.breakdowns = result.breakdowns
                let aqsApi = new AQS();
                aqsApi.getData({
                    project: [this.wiki.language.address],
                    access: ['desktop', 'mobile-web', 'mobile-app']
                }, {
                    metric: result.metricName,
                    agent_type: result.agent_type,
                    granularity: result.granularity,
                    start: result.range[0],
                    end: result.range[1]
                }).then(dimensionalData => {
                    this.graphModel = new GraphModel(result, dimensionalData);
                });
            });

            config.metrics(this.area).then((result) => {
                const relevantMetrics = Object.keys(result)
                    .filter((m) => result[m].area === this.area)

                this.otherMetrics =
                    relevantMetrics.map((m) => Object.assign(result[m], { name: m }))
            })
        },

        changeChart (t) {
            this.chartType = t.chart
            this.chartIcon = t.icon
        },

        toggleFullscreen () {
            this.fullscreen = !this.fullscreen

            // TODO: hack, figure out a way to re-render bar without this
            const t = this.metricData,
                  self = this
            this.metricData = {}
            setTimeout(function () {
                self.metricData = t
            }, 0)
        },

        addAnotherWiki () {
            $('.add.wiki.design').toggle('highlight')
        },

        changeHighlight (name, area) {
            this.highlightMetric = { name, area }
        },

        goHighlight (area) {
            const h = this.highlightMetric
            router.push('/' + h.area + '/' + h.name)
            $('.ui.metrics.modal').modal('hide')
        },

        setTimeRange (newRange) {
            this.metricData.range = newRange;
        }
    },
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
.left.panel .ui.toggle { margin-top: 10px; }
.left.panel .ui.toggle label { cursor: pointer!important; }
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
.ui.line.active.label {
    background-color: #a7a7a7!important;
    border: solid 2px #979797!important;
    font-weight: bold;
    color: #222!important;
}

.app .ui.toggle.checkbox input:checked ~ label:before {
    background-color: #227634!important;
}

.fullscreen .graph.panel {
    border-radius: 0;
}
.fullscreen.detail.container {
    margin: 0 -32px -27px -32px;
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

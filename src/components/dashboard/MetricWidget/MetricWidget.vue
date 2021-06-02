<template>
<div
    class="widget column" :class="{last: this.isLast()}"
    @mouseover="hovering=true" @mouseleave="hovering=false"
    >
    <div v-if="overlayMessage">
        <metric-placeholder-widget/>
        <status-overlay
            :project="project.replace(/-/g, ' ')"
            :metricName="$t(`metrics-${metric}-name`)"
            :overlayMessage="overlayMessage"/>
    </div>
    <div class="content">
        <div v-if="metricReady">
            <router-link class="metric link" :to="{project, area: area, metric: metric}">
                <widget-header :graphModel="graphModel" :graphData="graphData" />
            </router-link>
            <widget-chart :graphData="graphData" :graphModel="graphModel" />
            <widget-footer :graphData="graphData" :graphModel="graphModel" v-if="!topMetric" />
        </div>
    </div>
    <carousel-position v-if="mobile"
        :numberOfDots="parentMetricCount"
        :currentPosition="position" />
</div>
</template>

<script>
import { mapGetters } from 'vuex';

import WidgetChart from './WidgetChart';
import WidgetHeader from './WidgetHeader';
import WidgetFooter from './WidgetFooter';
import CarouselPosition from './CarouselPosition';
import StatusOverlay from '../../StatusOverlay';
import MetricPlaceholderWidget from './MetricPlaceholderWidget';

import AQS from 'Src/apis/aqs';
import config from 'Src/config';
import utils from 'Src/utils';
import GraphModel from 'Src/models/GraphModel';
import Dimension from 'Src/models/Dimension';
import RouterLink from '../../RouterLink';

let aqsApi = new AQS();

export default {
    name: 'metric-widget',
    props: ['metric', 'position', 'parentWidgetCount', 'parentMetricCount'],
    data () {
        return {
            hovering: false,
            graphModel: new GraphModel(this.$store.getters.project, this.metric)
        }
    },

    components: {
        WidgetChart,
        WidgetHeader,
        WidgetFooter,
        MetricPlaceholderWidget,
        StatusOverlay,
        RouterLink,
        CarouselPosition,
    },

    mounted () {
        this.graphModel.dimensions = Dimension.fromMetricConfig(this.metricConfig);
        this.loadData();
    },

    computed: Object.assign(
        mapGetters([
            'project'
        ]), {
            params () {
                return {
                    area: this.area,
                    metric: this.metric,
                    metricConfig: this.metricConfig,
                    timeRange: utils.getDefaultTimeRange(this.metricConfig),
                    granularity: 'monthly',
                };
            },
            metricConfig () {
                return config.metricConfig(this.metric);
            },
            overlayMessage () {
                return this.graphModel.status;
            },
            metricReady () {
                return this.graphData.length > 0 && !this.overlayMessage;
            },
            graphData () {
                if (['map', 'list'].includes(this.metricConfig.type)) {
                    return this.graphModel.graphData;
                } else {
                    // Adjust the data to the expected size and then
                    // normalize the data to look like the old data
                    // if building breakdowns into the widgets, look here first
                    return utils.adjustGraphData(
                        this.graphModel.graphData,
                        this.params.timeRange.timeKeyword,
                    ).map(d => ({
                        month: d.month,
                        total: d.total.total,
                    }));
                }
            },
            mobile () {
                return this.$mq === 'mobile';
            },
            topMetric () {
                return this.metricConfig.structure === 'top'
            },
            area () {
                return this.metricConfig.area;
            }
        }
    ),

   watch: {
        project () {
            this.graphModel.setProject(this.project);
        },
        params () {
            this.loadData();
        }
    },

    methods: {
        loadData () {
            this.graphModel.loadData({
                annotations: false
            });
        },

        isLast() {
            return this.position === this.parentWidgetCount - 1;
        }
    },
};
</script>

<style>
.fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
.two .widget.column {
    width: 49.32%!important;
}
.one .widget.column {
    width: 100%!important;
    margin-left: 0!important;
    margin-right: 0!important;
    right: 1px;
}
.widget.column {
    width: 32.6666666666%!important;
    height: 265px;
    margin-left: 0.3333333333%;
    margin-right: 0.3333333333%;
    background-color: #ffffff;
    border: 1px solid #d4d4d5;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
    color: #000!important;
    padding: 17px 22px!important;
}
.widget.column, .widget.column .status.overlay {
    border-radius: 0 0 10px 10px;
}
.widget.column:hover {
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.35);
}
.widget.column .content .metric.link {
    display: block;
    border: none;
}

.widget.column:first-child { margin-left: 0; margin-right: 0.6666666666%; }
.widget.column.last { margin-left: 0.6666666666%; margin-right: 0%; }


div.ui.small.horizontal.statistic > .value {
    text-align: left;
    font-size: 21px!important;
    font-weight: bold!important;
}
div.ui.small.horizontal.statistic > .label {
    margin-left: 10px;
    text-transform: none;
    font-size: 13px;
}
.change.label {
    color: #4a4a4a!important;
    font-style: italic;
    font-weight: 400;
}
div.ui.horizontal.statistic {
    margin: 4px 2px 2px 2px;
}
.subdued {
    color: #72777d;
}
</style>

<template>
<div class="widget column" :class="{last: this.isLast()}">
    <router-link :to="{project, area, metric: metric.name}">
        <metric-placeholder-widget
            v-if="!graphModel">
        </metric-placeholder-widget>
        <div v-else>
            <metric-list-widget
                :data="graphData"
                v-if="graphModel.config.structure === 'top'"
                :graphModel="graphModel">
            </metric-list-widget>
            <div v-else>
                <div class="ui medium statistic">
                    <div class="label">{{graphModel.config.fullName}}</div>
                    <div class="value" >{{ (lastMonth.total)| bytesOrKmb(unit) }}</div>
                </div>
                <div>
                    <span class="subdued">{{ (lastMonth.month) | getMonthLabel(months) }}</span>
                    <span class="change label">
                        <span v-if="changeMoM">
                            <arrow-icon :value="changeMoM"/>
                            {{changeMoM}} % month over month
                        </span>
                        <span v-else>
                            (no data last month)
                        </span>
                    </span>
                </div>
                <metric-bar-widget
                    v-if="graphModel.config.type === 'bars'"
                    :data="graphData"
                    :graphModel="graphModel">
                </metric-bar-widget>
                <metric-line-widget
                    v-else-if="graphModel.config.type === 'lines'"
                    :data="graphData"
                    :graphModel="graphModel">
                </metric-line-widget>
                <div class="ui horizontal small statistic">
                    <div class="value" v-if="changeYoY">
                        {{lastYearAggregation| bytesOrKmb(unit) }}
                    </div>
                    <div class="change label" v-if="changeYoY">
                        <arrow-icon :value="changeYoY"/>
                        {{changeYoY}} % year over year
                    </div>
                </div>
                <div class="year total subdued">
                    <span v-if="changeYoY">
                        <span v-if="monthOneYearAgo">Year {{aggregationType}} ({{monthOneYearAgo.month.getFullYear()}})</span>
                        <span v-else>{{aggregationType}} (all available data)</span>
                    </span>
                    <span v-else>
                        (no data last year)
                    </span>
                </div>
            </div>
        </div>
    </router-link>
    <status-overlay v-if="overlayMessage" :overlayMessage="overlayMessage"/>
    <carousel-position v-if="mobile" :numberOfDots="metricsInArea.length" :currentPosition="position"></carousel-position>
</div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

import _ from '../../lodash-custom-bundle';
import MetricBarWidget from './MetricBarWidget'
import MetricLineWidget from './MetricLineWidget'
import MetricListWidget from './MetricListWidget'
import CarouselPosition from './CarouselPosition'
import StatusOverlay from '../StatusOverlay'
import MetricPlaceholderWidget from './MetricPlaceholderWidget'
import ArrowIcon from '../ArrowIcon';

import AQS from '../../apis/aqs';
import config from '../../config';
import utils from '../../utils';
import GraphModel from '../../models/GraphModel';
import RouterLink from '../RouterLink';

let aqsApi = new AQS();

let defaultRange = utils.getDefaultTimeRange();

export default {
    name: 'metric-widget',
    props: ['metric', 'area', 'position', 'parentWidgetCount'],
    data () {
        return {
            graphModel: null,
            overlayMessage: null,
        }
    },

    components: {
        MetricBarWidget,
        MetricLineWidget,
        MetricListWidget,
        MetricPlaceholderWidget,
        StatusOverlay,
        ArrowIcon,
        RouterLink,
        CarouselPosition
    },

    computed: Object.assign(
        mapState([
            'project'
        ]), {
            params () {
                return {
                    project: this.project,
                    area: this.area,
                    metric: this.metric.name,
                    metricConfig: config.metricData(this.metric.name),
                    range: defaultRange,
                    granularity: 'monthly',
                };
            },

            graphData () {
                if (!this.graphModel) { return []; }

                if (['map', 'list'].includes(this.graphModel.config.type)) {
                    return this.graphModel.graphData;
                } else {
                    // normalize the data to look like the old data
                    // if building breakdowns into the widgets, look here first
                    return this.graphModel.graphData.map(d => ({
                        month: d.month,
                        total: d.total.total,
                    }));
                }
            },

            monthOneYearAgo: function () {

                if (!this.lastMonth) { return null; }

                let last = _.indexOf(this.graphData, this.lastMonth);
                const lastMonth = this.graphData[last].month;

                while (last > 0) {
                    last--;
                    if (lastMonth - this.graphData[last].month >= 31536000000) {
                        return this.graphData[last];
                    }
                }
                return null;
            },
            lastYearAggregation: function () {
                return this.graphModel.getLimitedAggregate(12);
            },
            lastMonth: function () {
                return  _.last(this.graphData);

            },
            changeMoM: function () {

                const data = this.graphData;
                const prev = data[data.length - 2];

                if (!prev
                    || !prev.total
                    || this.lastMonth.month - prev.month > 2764800000) {
                    return null;
                }

                const diff = this.lastMonth.total - prev.total;
                return ((diff / prev.total) * 100).toFixed(2);
            },
            changeYoY: function () {
                // TODO: We're showing more than the last year, but reporting YoY.  This can be confusing because the YoY might not match up visually with the graph (like for Unique Devices in Achinese).

                if (!this.monthOneYearAgo
                    || !this.monthOneYearAgo.total) {
                    return null;
                }

                const diff = this.lastMonth.total - this.monthOneYearAgo.total;
                return ((diff / this.monthOneYearAgo.total) * 100).toFixed(2);
            },
            disabled: function () {
                return !this.params.metricConfig.global && this.$store.state.project === config.ALL_PROJECTS;
            },
            aggregationType: function () {
                return this.graphModel.getAggregateLabel().toLowerCase();
            },
            unit: function(){
                    if (this.graphModel.config.unit ){
                        return this.graphModel.config.unit;
                    }
            },
            months: function(){
                return config.months;
            },
            mobile () {
                return this.$mq === 'mobile';
            },
            metricsInArea(){
                return config.areaData().find(a => a.state.id === this.area).state.metrics;
            }
        }
    ),

    mounted () {
        this.loadData(this.params);
    },

   watch: {
        params () {
                this.loadData(this.params);
        }
    },

    methods: {


        loadData (params) {

            if (this.disabled) {
                this.overlayMessage = StatusOverlay.NON_GLOBAL(params.metricConfig.fullName);
                return;
            }

            this.aqsApi = new AQS();

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

            let dataPromise = this.aqsApi.getData(uniqueParameters, commonParameters);
            this.overlayMessage = StatusOverlay.LOADING;

            dataPromise.catch((req, status, error) => {
                this.overlayMessage = StatusOverlay.getMessageForStatus(req.status);
            });
            dataPromise.then(dimensionalData => {
                this.overlayMessage = null;
                this.graphModel = new GraphModel(params.metricConfig);
                this.graphModel.setData(dimensionalData);
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
    padding: 13px 22px!important;
}
.widget.column, .widget.column .status.overlay {
    border-radius: 0 0 10px 10px;
}
.widget.column:hover {
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.35);
    cursor: pointer;
}

.widget.column:first-child { margin-left: 0; margin-right: 0.6666666666%; }
.widget.column.last { margin-left: 0.6666666666%; margin-right: 0%; }

.ui.medium.statistic > .label {
    text-transform: capitalize;
    text-align: left;
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 8px;
}
.ui.medium.statistic > .value {
    text-align: left;
    font-size: 50px!important;
    font-weight: bold!important;
}
.ui.medium.statistic {
    margin-bottom: 0;
}
.ui.small.horizontal.statistic > .value {
    text-align: left;
    font-size: 25px!important;
    font-weight: bold!important;
}
.ui.small.horizontal.statistic > .label {
    margin-left: 10px;
    text-transform: none;
    font-size: 13px;
}

.change.label {
    color: #4a4a4a!important;
    font-style: italic;
    font-weight: 400;
}

.ui.horizontal.statistic {
    margin: 4px 2px 2px 2px;
}
.subdued {
    color: #72777d;
}
</style>

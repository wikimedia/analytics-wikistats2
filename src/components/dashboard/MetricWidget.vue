<template>
<div class="widget column">
    <router-link :to="{project, area, metric: metric.name}">
        <metric-placeholder-widget
            v-if="!graphModel">
        </metric-placeholder-widget>
        <div v-else>
            <metric-list-widget
                v-if="graphModel.config.type === 'list'"
                :data="graphData"
                :graphModel="graphModel">
            </metric-list-widget>
            <div v-else>
                <div class="ui medium statistic">
                    <div class="label">{{graphModel.config.fullName}}</div>
                    <div class="value">{{graphModel.formatNumberForMetric(lastMonth.total)}}</div>
                </div>
                <div>
                    <span class="subdued">{{getMonthValue(lastMonth.month)}}</span>
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
                        {{graphModel.formatNumberForMetric(lastYearAggregation)}}
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
</div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

import MetricBarWidget from './MetricBarWidget'
import MetricLineWidget from './MetricLineWidget'
import MetricListWidget from './MetricListWidget'
import StatusOverlay from '../StatusOverlay'
import MetricPlaceholderWidget from './MetricPlaceholderWidget'
import TimeRangeSelector from '../TimeRangeSelector';
import ArrowIcon from '../ArrowIcon';

import AQS from '../../apis/aqs';
import config from '../../config';
import GraphModel from '../../models/GraphModel';
import RouterLink from '../RouterLink';

let aqsApi = new AQS();

export default {
    name: 'metric-widget',
    props: ['metric', 'area'],
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
        RouterLink
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
                    range: TimeRangeSelector.getDefaultTimeRange(),
                    granularity: 'monthly',
                };
            },

            graphData () {
                if (!this.graphModel) { return []; }

                if (this.graphModel.config.type === 'list') {
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
                return _.last(this.graphData);
            },
            changeMoM: function () {
                if (!this.lastMonth) { return null; }

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
                return this.graphModel.getAggregateLabel();
            }
        }
    ),

    mounted () {
        this.aqsApi = new AQS();
        this.loadData();
    },

    watch: {
        params () {
            this.graphModel = null;
            // allow the placeholders to reset before loading new data
            Vue.nextTick(() => this.loadData());
        },
    },

    methods: {
        getMonthValue (date) {
            return config.months[date.getMonth() + 1];
        },

        loadData () {
            const params = this.params;

            if (this.disabled) {
                this.overlayMessage = StatusOverlay.NON_GLOBAL(params.metricConfig.fullName);
                return;
            }

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
                    granularity: params.granularity
                }
            );

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
    },
};
</script>

<style>
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
.widget.column:last-child { margin-left: 0.6666666666%; margin-right: 0%; }

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
    color: #9b9b9b;
}
</style>

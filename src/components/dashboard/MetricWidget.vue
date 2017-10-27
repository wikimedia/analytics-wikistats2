<template>
<div class="widget column">
    <router-link :to="{project, area, metric: metric.name}">
        <metric-placeholder-widget
            v-if="!graphModel">
        </metric-placeholder-widget>
        <div v-else>
            <metric-list-widget
                v-if="metricData.type === 'list'"
                :metricData="metricData"
                :graphModel="graphModel">
            </metric-list-widget>
            <div v-else>
                <div class="ui medium statistic">
                    <div class="label">{{metricData.fullName}}</div>
                    <div class="value">{{lastMonth.total | kmb}}</div>
                </div>
                <div>
                    <span class="subdued">{{getMonthValue(lastMonth.month)}}</span>
                    <span class="change label">
                        <arrow-icon :value="changeMoM"/>
                        {{changeMoM}} % month over month
                    </span>
                </div>
                <metric-bar-widget
                    v-if="metricData.type === 'bars'"
                    :metricData="metricData"
                    :graphModel="graphModel">
                </metric-bar-widget>
                <metric-line-widget
                    v-else-if="metricData.type === 'lines'"
                    :metricData="metricData"
                    :graphModel="graphModel">
                </metric-line-widget>
                <div class="ui horizontal small statistic">
                    <div class="value">
                        {{lastYearAggregation | kmb}}
                    </div>
                    <div class="change label">
                        <arrow-icon :value="changeYoY"/>
                        {{changeYoY}} % year over year
                    </div>
                </div>
                <div class="year total subdued">
                    Year {{aggregationType}} ({{monthOneYearAgo.month.split('-')[0]}})
                </div>
            </div>
        </div>
    </router-link>
    <status-overlay v-if="overlayMessage" :overlayMessage="overlayMessage"/>
</div>
</template>

<script>
import { mapState } from 'vuex';

import MetricBarWidget from './MetricBarWidget'
import MetricLineWidget from './MetricLineWidget'
import MetricListWidget from './MetricListWidget'
import StatusOverlay from '../StatusOverlay'
import MetricPlaceholderWidget from './MetricPlaceholderWidget'
import TimeRangeSelector from '../TimeRangeSelector';
import config from '../../config';

import AQS from '../../apis/aqs';
import GraphModel from '../../models/GraphModel';
import dateformat from 'dateformat';
import ArrowIcon from '../ArrowIcon';
import RouterLink from '../RouterLink';

let aqsApi = new AQS();

export default {
    name: 'metric-widget',
    props: ['metric', 'area'],
    data () {
        return {
            metricData: undefined,
            graphModel: undefined,
            overlayMessage: null
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

    mounted () {
        this.loadConfig();
    },

    methods: {
        loadConfig () {
            this.metricData = config.metricData(this.metric.name, this.area);
        },
        getMonthValue (date) {
            return config.months[parseInt(date.split('-')[1])];
        }
    },

    computed: Object.assign(
        mapState([
            'project'
        ]), {
            aqsParameters () {
                if (!this.metricData || !this.project) { return; }
                const defaults = this.metricData.defaults;
                const range = TimeRangeSelector.getDefaultTimeRange();
                return {
                    unique: Object.assign(
                        defaults.unique,
                        { project: [this.project] },
                    ),
                    common: Object.assign(
                        defaults.common,
                        {
                            start: range[0],
                            end: range[1],
                            granularity: 'monthly'
                        }
                    )
                };
            },
            monthOneYearAgo: function () {
                return this.graphData[_.indexOf(this.graphData, this.lastMonth) - 12];
            },
            lastYearAggregation: function () {
                return this.graphModel.getLimitedAggregate(12);
            },
            lastMonth: function () {
                return _.last(this.graphData);
            },
            graphData: function () {
                return this.graphModel.getGraphData();
            },
            changeMoM: function () {
                const data = this.graphData;
                const prev = data[data.length - 2];
                const diff = this.lastMonth.total - prev.total;
                return ((diff / prev.total) * 100).toFixed(2);
            },
            changeYoY: function () {
                // TODO: We're showing more than the last year, but reporting YoY.  This can be confusing because the YoY might not match up visually with the graph (like for Unique Devices in Achinese).

                const diff = this.lastMonth.total - this.monthOneYearAgo.total;
                return ((diff / this.monthOneYearAgo.total) * 100).toFixed(2);
            },
            disabled: function () {
                return !this.metricData.global && this.$store.state.project === 'all-projects';
            },
            aggregationType: function () {
                return this.graphModel.getAggregateLabel();
            }
        }
    ),

    watch: {
        aqsParameters () {
            this.loadConfig();
            if (this.disabled) {
                this.overlayMessage = StatusOverlay.NON_GLOBAL(this.metricData.fullName);
                this.graphModel = null;
                return;
            }
            const { unique, common } = this.aqsParameters;
            let dataPromise = aqsApi.getData(unique, common);
            this.overlayMessage = StatusOverlay.LOADING;
            dataPromise.catch(req => {
                this.overlayMessage = StatusOverlay.getMessageForStatus(req.status);
            });
            dataPromise.then(dimensionalData => {
                this.overlayMessage = null;
                this.graphModel = new GraphModel(this.metricData, dimensionalData);
            })
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
    border-radius: 0 0 10px 10px;
    border: 1px solid #d4d4d5;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);

    color: #000!important;
    padding: 13px 22px!important;
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

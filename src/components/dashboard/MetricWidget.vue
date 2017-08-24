<template>
<router-link class="widget column" :to="'/' + project + '/' + area + '/' + metric.name">
    <metric-placeholder-widget
        v-if="!graphModel">
    </metric-placeholder-widget>

    <metric-bar-widget
        v-else-if="metricData.type === 'bars'"
        :metricData="metricData"
        :graphModel="graphModel">
    </metric-bar-widget>

    <metric-line-widget
        v-else-if="metricData.type === 'lines'"
        :metricData="metricData"
        :graphModel="graphModel">
    </metric-line-widget>

    <metric-list-widget
        v-else-if="metricData.type === 'list'"
        :metricData="metricData"
        :graphModel="graphModel">
    </metric-list-widget>
    <status-overlay v-if="overlayMessage" :overlayMessage="overlayMessage"/>
</router-link>
</template>

<script>
import { mapState } from 'vuex';

import MetricBarWidget from './MetricBarWidget'
import MetricLineWidget from './MetricLineWidget'
import MetricListWidget from './MetricListWidget'
import StatusOverlay from '../StatusOverlay'
import MetricPlaceholderWidget from './MetricPlaceholderWidget'

import config from '../../config'

import AQS from '../../apis/aqs'
import GraphModel from '../../models/GraphModel'

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
        StatusOverlay
    },

    mounted () {
        this.loadConfig();
    },

    methods: {
        loadConfig () {
            this.metricData = config.metricData(this.metric.name, this.area);
        },
    },

    computed: Object.assign(
        mapState([
            'project'
        ]), {
            aqsParameters () {
                if (!this.metricData || !this.project) { return; }
                const defaults = this.metricData.defaults;

                return {
                    unique: Object.assign(
                        defaults.unique,
                        { project: [this.project] },
                    ),
                    common: defaults.common
                };
            },
        }
    ),

    watch: {
        aqsParameters () {
            const { unique, common } = this.aqsParameters;

            let dataPromise = aqsApi.getData(unique, common);
            this.overlayMessage = StatusOverlay.LOADING;
            dataPromise.catch((req, status, error) => {
                if (req.status === 404) {
                    this.overlayMessage = StatusOverlay.NO_DATA;
                } else {
                    this.overlayMessage = StatusOverlay.GENERAL_ERROR;
                }
            });
            dataPromise.then(dimensionalData => {
                this.overlayMessage = null;
                this.graphModel = new GraphModel(this.metricData, dimensionalData);
            });
        },
    },
}
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

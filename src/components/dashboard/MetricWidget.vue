<template>
<router-link v-if="graphModel" class="widget column" :to="area + '/' + metric.name">
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

    <metric-list-widget
        v-else-if="metricData.type === 'list'"
        :metricData="metricData"
        :graphModel="graphModel">
    </metric-list-widget>
</router-link>
</template>

<script>
import MetricBarWidget from './MetricBarWidget'
import MetricLineWidget from './MetricLineWidget'
import MetricListWidget from './MetricListWidget'
import config from '../../apis/Configuration'

import AQS from '../../apis/aqs'
import GraphModel from '../../models/GraphModel'

export default {
    name: 'metric-widget',
    props: ['metric', 'area', 'wiki'],
    data () {
        return {
            loading: false,
            metricData: {},
            graphModel: null
        }
    },

    components: {
        MetricBarWidget,
        MetricLineWidget,
        MetricListWidget,
    },

    watch: {
        '$route.params': 'load',
    },

    created () {
        this.load()
    },

    //afterUpdate () {
        //this.drawChart()
    //},

    methods: {
        load () {
            this.loading = true

            config.metricData(this.metric.name, this.area).then((result) => {
                this.loading = false
                this.metricData = result
                this.breakdowns = result.breakdowns
                let aqsApi = new AQS();
                aqsApi.getData({
                    project: [this.wiki.urlName],
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
            })
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

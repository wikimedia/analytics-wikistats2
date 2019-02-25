<template>
<div
    class="widget column" :class="{last: this.isLast()}"
    @mouseover="hovering=true" @mouseleave="hovering=false"
    >
    <div v-if="overlayMessage && !groupShifting">
        <metric-placeholder-widget/>
        <status-overlay :overlayMessage="overlayMessage"/>
    </div>
    <div class="content">
        <div v-if="graphModel && !overlayMessage">
            <router-link class="metric link" :to="{project, area: area, metric: metricName}">
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
import { mapState } from 'vuex';

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
import RouterLink from '../../RouterLink';

let aqsApi = new AQS();

export default {
    name: 'metric-widget',
    props: ['metrics', 'position', 'parentWidgetCount', 'parentMetricCount'],
    data () {
        return {
            graphModel: null,
            overlayMessage: null,
            groupName: null,
            metricIndex: 0,
            groupShifting: null,
            hovering: false,
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
        this.loadData(this.params);
        if (this.metrics.length > 1 && !this.mobile) {
            setInterval(() => {
                if (this.hovering || !document.hasFocus()) { return; }

                this.groupShifting = true;
                $('.content', this.$el).fadeOut(500, () => {
                    this.metricIndex = (this.metricIndex + 1) % this.metrics.length;
                    $('.content', this.$el).fadeIn(500, () => {
                        this.groupShifting = false;
                    });
                });

            }, 8000);
        }
    },

    computed: Object.assign(
        mapState([
            'project'
        ]), {
            params () {
                return {
                    project: this.project,
                    area: this.area,
                    metric: this.metricName,
                    metricConfig: this.metricConfig,
                    timeRange: utils.getDefaultTimeRange(this.metricConfig),
                    granularity: 'monthly',
                };
            },

            metricName () {
                return this.metrics[this.metricIndex];
            },
            metricConfig () {
                return config.metricConfig(this.metricName);
            },
            graphData () {
                if (!this.graphModel) { return []; }

                if (['map', 'list'].includes(this.metricConfig.type)) {
                    return this.graphModel.graphData;
                } else {
                    // Adjust the data to the expected size and then
                    // normalize the data to look like the old data
                    // if building breakdowns into the widgets, look here first
                    return utils.adjustGraphData(
                        this.graphModel.graphData,
                        this.params.timeRange.name
                    ).map(d => ({
                        month: d.month,
                        total: d.total.total,
                    }));
                }
            },
            disabled: function () {
                return metricNotGlobalAndAllProjectsSelected || metricNotFamilyGlobalAndFamilySelected;
            },
            mobile () {
                return this.$mq === 'mobile';
            },
            topMetric () {
                return this.metricConfig.structure === 'top'
            },
            metricNotGlobalAndAllProjectsSelected () {
                return (!this.metricConfig.global && this.project === config.ALL_PROJECTS)
            },
            metricNotFamilyGlobalAndFamilySelected () {
                return (!this.metricConfig.globalFamily && utils.isProjectFamily(this.project))
            },
            area () {
                return this.metricConfig.area;
            }
        }
    ),

   watch: {
        params () {
            this.loadData(this.params);
        }
    },

    methods: {
        loadData (params) {
            const project = this.$store.state.project;
            if (this.metricNotGlobalAndAllProjectsSelected) {
                this.overlayMessage = StatusOverlay.NON_GLOBAL(params.metricConfig.fullName);
                return;
            } else if (this.metricNotFamilyGlobalAndFamilySelected) {
                this.overlayMessage = StatusOverlay.NON_GLOBAL_FAMILY(params.metricConfig.fullName, project);
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
            const getAll = params.metricConfig.cumulative;
            const requestInterval = utils.getRequestInterval(getAll ? {name: 'All'} : params.timeRange);
            const commonParameters = Object.assign(
                {},
                defaults.common,
                {
                    start: requestInterval.start,
                    end: requestInterval.end,
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
                if (dimensionalData.getAllItems().length === 0) {
                    this.overlayMessage = StatusOverlay.NO_DATA;
                }
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


.ui.small.horizontal.statistic > .value {
    text-align: left;
    font-size: 21px!important;
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

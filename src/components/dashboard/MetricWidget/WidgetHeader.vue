<template>
    <div class="ui medium statistic">
        <div class="label">
            {{$t(`metrics-${metricId}-name`)}}
            <a v-if="wikistats1URL" class="metric link wikistats1" :href="wikistats1URL" target="_blank" v-hint:wikistats1Metric.s>
                <img class="wikimedia-logo" src="../../../assets/Wikimedia-logo.svg" alt="wikimedia-logo" />
            </a>
        </div>
        <div v-if="graphModel.config.structure === 'top'" class="subdued">
            {{$t('widget_header-subtitle_for_last_month', {subtitle: $t(`metrics-${metricId}-subtitle`), lastMonthLabel})}}
        </div>
        <div v-else>
            <div class="value">{{ (lastMonth.total)| bytesOrKmb(unit) }}</div>
            <div>
                <span class="subdued month">{{ lastMonthLabel }}</span>
                <period-change-indicator
                    :period="'month'"
                    :startValue="graphData[graphData.length - 2].total"
                    :endValue="lastMonth.total"/>
            </div>
        </div>
    </div>
</template>
<script type="text/javascript">
    import _ from 'Src/lodash-custom-bundle';
    import config from 'Src/config';
    import PeriodChangeIndicator from './PeriodChangeIndicator';
    export default {
        name: 'widget-header',
        props: ['graphModel', 'graphData'],
        components: {PeriodChangeIndicator},
        computed: {
            wikistats1URL: function () {
                return this.graphModel.config.wikistats1URL;
            },

            unit: function(){
                if (this.graphModel.config.unit){
                    return this.graphModel.config.unit;
                }
            },
            lastMonth: function () {
                return  _.last(this.graphData);

            },
            lastMonthLabel () {
                const date = this.lastMonth.month;
                return this.$t(`months-${this.months[date.getUTCMonth() + 1]}`);
            },
            months: function(){
                return config.months;
            },
            metricId: function () {
                return this.graphModel.metricId;
            }
        }
    }
</script>

<style>
.ui.medium.statistic .value {
    color: #444;
    text-align: left;
    font-size: 46px!important;
    font-weight: bold!important;
    line-height: 46px;
}
.ui.medium.statistic > .label {
    text-transform: none;
    text-align: left;
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 8px;
}
.ui.medium.statistic {
    margin-bottom: 0;
}
.widget.column .content .metric.link.wikistats1 {
    margin-left: 10px;
    display: inline;
}
.widget.column .content .metric.link.wikistats1 img {
    width: 20px;
}
.subdued.month {
    text-transform: capitalize;
}
</style>

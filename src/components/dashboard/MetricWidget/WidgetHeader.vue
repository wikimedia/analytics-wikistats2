<template>
    <div class="ui medium statistic">
        <div class="label">{{graphModel.config.fullName}}</div>
        <div v-if="graphModel.config.structure === 'top'" class="subdued">
            {{graphModel.config.subtitle + ' for ' + lastMonthLabel}}
        </div>
        <div v-else>
            <div class="value">{{ (lastMonth.total)| bytesOrKmb(unit) }}</div>
            <div>
                <span class="subdued">{{ (lastMonth.month) | getMonthLabel(months) }}</span>
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
                return config.months[date.getUTCMonth() + 1];
            },
            months: function(){
                return config.months;
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
</style>
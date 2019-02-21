<template>
    <div>
        <div class="ui horizontal small statistic">
            <div class="value" v-if="changeYoY">
                {{lastYearAggregation| bytesOrKmb(unit) }}
            </div>
            <period-change-indicator
                :period="'year'"
                :startValue="monthOneYearAgo.total"
                :endValue="lastMonth.total"/>
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
</template>
<script type="text/javascript">
    import _ from 'Src/lodash-custom-bundle';
    import PeriodChangeIndicator from './PeriodChangeIndicator';
    export default {
        name: 'widget-footer',
        props: ['graphModel', 'graphData'],
        components: {PeriodChangeIndicator},
        computed: {
            lastYearAggregation: function () {
                return this.graphModel.getLimitedAggregate(12);
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
            lastMonth: function () {
                return  _.last(this.graphData);
            },
            aggregationType: function () {
                return this.graphModel.getAggregateLabel().toLowerCase();
            },
            unit: function(){
                    if (this.graphModel.config.unit ){
                        return this.graphModel.config.unit;
                    }
            },
        }
    }
</script>

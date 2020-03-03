<template>
    <div>
        <div class="ui horizontal small statistic">
            <div class="value" v-if="changeYoY">
                {{lastYearAggregation| bytesOrKmb(unit) }}
            </div>
            <period-change-indicator
                v-if="changeYoY"
                :period="'year'"
                :startValue="monthOneYearAgo.total"
                :endValue="lastMonth.total"/>
        </div>
        <div class="year total subdued">
            <span v-if="changeYoY">
                <span v-if="monthOneYearAgo">
                    <span style="text-transform: capitalize;" v-if="aggregationType =='total'">
                        {{$t('general-last_12_months')}}
                    </span>
                    <span style="text-transform: capitalize;" v-else>
                        {{$t('general-12_month_average')}}
                    </span>
                    ({{widgetPeriod}})
                </span>
            </span>
            <span v-else>
                {{$t('general-no_data')}}
            </span>
        </div>
    </div>
</template>
<script type="text/javascript">
import _ from 'Src/lodash-custom-bundle';
import PeriodChangeIndicator from './PeriodChangeIndicator';
import config from 'Src/config';
import TimeRange from 'Src/models/TimeRange';
export default {
    name: 'widget-footer',
    props: ['graphModel', 'graphData'],
    components: {PeriodChangeIndicator},
    computed: {
        widgetPeriod: function() {
            const EXPLICIT_TIMERANGE = true;
            const tr = new TimeRange([this.monthOneYearAgo.month, this.lastMonth.month]);
            return tr.getFormattedTimeRange(this.graphModel.granularity, this.graphModel.config.structure, EXPLICIT_TIMERANGE);
        },

        lastYearAggregation: function() {
            return this.graphModel.getLimitedAggregate(12);
        },
        changeYoY: function() {
            // TODO: We're showing more than the last year, but reporting YoY.  This can be confusing because the YoY might not match up visually with the graph (like for Unique Devices in Achinese).

            if (!this.monthOneYearAgo || !this.monthOneYearAgo.total) {
                return null;
            }

            const diff = this.lastMonth.total - this.monthOneYearAgo.total;
            return (diff / this.monthOneYearAgo.total * 100).toFixed(2);
        },
        monthOneYearAgo: function() {
            if (!this.lastMonth) {
                return null;
            }
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
        lastMonth: function() {
            return _.last(this.graphData);
        },
        aggregationType: function() {
            return this.graphModel.getAggregateLabel().toLowerCase();
        },
        unit: function() {
            if (this.graphModel.config.unit) {
                return this.graphModel.config.unit;
            }
        }
    }

};
</script>

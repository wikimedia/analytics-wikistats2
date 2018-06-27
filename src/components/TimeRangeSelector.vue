<template>
    <div class="ui buttons">
        <button v-for="r in rangeNames"
                @click="changeTimeRange(r)"
                class="ui button"
                :class="{ active: isActive(r) }"
                :disabled="isFrozen(r)">{{r}}</button>
    </div>
</template>

<script>
import dateFormat from 'dateformat';
import utils from '../utils';
import { mapState } from 'vuex';
import config from '../config';

export default {
    name: 'time-range-selector',

    props: ['lastMonth', 'frozen'],

    data () {
        return {
            rangeNames: ['All', '2-Year', '1-Year', '3-Month', '1-Month'],
        };
    },

    computed: mapState('detail', [
        'timeRange',
    ]),

    methods: {
        getRangeFromName (name) {
            const last = this.lastMonth;

            // by convention end of the interval is today's UTC date
            // this could be better (how?)
            const now = utils.createNowUTCDate();
            const lastMonthAvailable = dateFormat(now, 'yyyymmdd00', true);

            let start = dateFormat(config.startTimestamp, 'yyyymmdd00', true);

            if (name !== 'All') {
                let d = utils.createNowUTCDate();
                d.setTime(last.getTime());
                // the monthly requests for apis have to be inclusive of the whole
                // month to return data for that month.
                if (name === '2-Year') {
                    d.setYear(d.getUTCFullYear() - 2)
                } else if (name === '1-Year') {
                    d.setYear(d.getUTCFullYear() - 1)
                } else if (name === '3-Month') {
                    let currentMonth = d.getUTCMonth();

                    // months start at 0
                    if (currentMonth >= 3){
                        d.setUTCMonth(d.getUTCMonth() - 3);
                    } else {
                        d.setYear(d.getUTCFullYear() - 1);
                        currentMonth = currentMonth + 12;
                        d.setUTCMonth(currentMonth - 3);
                    }
                } else if (name === '1-Month') {
                    let currentMonth = d.getUTCMonth();

                    // months start at 0
                    if (currentMonth >= 1){
                        d.setUTCMonth(d.getUTCMonth() - 1);
                    } else {
                        d.setYear(d.getUTCFullYear() - 1)
                        currentMonth = currentMonth + 12;
                        d.setUTCMonth(currentMonth - 1);
                    }
                }
                start = dateFormat(d, 'yyyymmdd00', true);
            }
            return {
                name,
                start: start,
                end: lastMonthAvailable
            };
        },
        changeTimeRange (rangeName) {
            this.$store.commit('detail/timeRange', { timeRange: this.getRangeFromName(rangeName) });
        },
        isActive (rangeName) {
            return rangeName === this.timeRange.name;
        },
        isFrozen (rangeName) {
            if (this.frozen && !this.isActive(rangeName)) {
                return true;
            }
        }
    }
}
</script>

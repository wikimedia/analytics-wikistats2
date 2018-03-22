<template>
    <div class="ui buttons">
        <button v-on:click='changeTimeRange' :class="isActive('All')">All</button>
        <button v-on:click='changeTimeRange' :class="isActive('2-Year')">2-Year</button>
        <button v-on:click='changeTimeRange' :class="isActive('1-Year')">1-Year</button>
        <button v-on:click='changeTimeRange' :class="isActive('3-Month')">3-Month</button>
        <button v-on:click='changeTimeRange' :class="isActive('1-Month')">1-Month</button>
    </div>
</template>

<script>
import dateFormat from 'dateformat';
import utils from '../utils';

export default {
    name: 'time-range-selector',

    props: ['lastMonth'],

    data () {
        return {
            activeRange: '2-Year'
        }
    },

    methods: {
        changeTimeRange (e) {

            this.activeRange = e.target.textContent;
            const last = this.lastMonth;

            // by convention end of the interval is today's UTC date
            // this could better but abiding to this for now
            const now = utils.createNowUTCDate();

            const lastMonthAvailable = dateFormat(now, "yyyymmddhh");
            const ranges = {
                'All': () => {
                    return ['1980010100', lastMonthAvailable]
                },
                '2-Year': () => {
                    let d = utils.createNowUTCDate();
                    d.setTime(last.getTime());
                    d.setYear(d.getUTCFullYear() - 2)

                    return [dateFormat(d, "yyyymmddhh"), lastMonthAvailable ]
                },
                '1-Year': () => {
                    let d = utils.createNowUTCDate();
                    d.setTime(last.getTime());

                    d.setYear(d.getUTCFullYear() - 1)
                    return [dateFormat(d, "yyyymmddhh"), lastMonthAvailable ]
                },
                '3-Month': () => {
                    let d = utils.createNowUTCDate();
                    d.setTime(last.getTime());

                    let currentMonth = d.getUTCMonth();
                    // months start at 0
                    if (currentMonth>=3){
                        d.setUTCMonth(d.getUTCMonth() - 3);
                    } else {
                        d.setYear(d.getUTCFullYear() - 1);
                        currentMonth = currentMonth + 12;
                        d.setUTCMonth(currentMonth-3);
                    }

                    return [dateFormat(d, "yyyymmddhh"), lastMonthAvailable ]
                },
                '1-Month': () => {
                    let d = utils.createNowUTCDate();
                    d.setTime(last.getTime());

                    d.setUTCMonth(d.getUTCMonth() - 1)
                    let currentMonth = d.getUTCMonth();
                    // months start at 0
                    if (currentMonth>=1){
                        d.setUTCMonth(d.getUTCMonth() - 1);
                    } else {
                        d.setYear(d.getUTCFullYear() - 1)
                        currentMonth = currentMonth + 12;
                        d.setUTCMonth(currentMonth-1);
                    }

                    return [dateFormat(d, "yyyymmddhh"), lastMonthAvailable ]
                }
            };
            this.$emit('changeTimeRange', ranges[this.activeRange]());
        },
        isActive (range) {
            if (range === this.activeRange) return 'ui button active';
            return 'ui button';
        }
    }

}
</script>


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

export default {
    name: 'time-range-selector',
    data () {
        return {
            activeRange: '2-Year'
        }
    },
    methods: {
        changeTimeRange (e) {
            this.activeRange = e.target.textContent;
            let d = new Date();
            let beginningOfThisMonth = new Date();
            beginningOfThisMonth.setDate(1);
            const now = dateFormat(new Date(), "yyyymmddhh");
            const ranges = {
                'All': () => {
                    return ['1980010100', now]
                },
                '2-Year': () => {
                    d.setYear(d.getFullYear() - 2)
                    return [dateFormat(d, "yyyymmddhh"), now]
                },
                '1-Year': () => {
                    d.setYear(d.getFullYear() - 1)
                    return [dateFormat(d, "yyyymmddhh"), now]
                },
                '3-Month': () => {
                    d.setMonth(d.getMonth() - 3)
                    return [dateFormat(d, "yyyymmddhh"), now]
                },
                '1-Month': () => {
                    d.setMonth(d.getMonth() - 1)
                    return [dateFormat(d, "yyyymmddhh"), now]
                }
            };
            this.$emit('changeTimeRange', ranges[this.activeRange]());
        },
        isActive (range) {
            if (range === this.activeRange) return 'ui button active';
            return 'ui button';
        }
    },
    getDefaultTimeRange () {
        const end = new Date();
        const start = new Date();
        start.setYear(end.getFullYear() - 2);
        return [dateFormat(start, 'yyyymmdd00'),
                dateFormat(end, 'yyyymmdd00')];
    }
}
</script>


<template>
<div class="ui buttons">
    <button v-on:click='changeTimeRange' class="ui button">All</button>
    <button v-on:click='changeTimeRange' class="ui button">2-Year</button>
    <button v-on:click='changeTimeRange' class="ui button">1-Year</button>
    <button v-on:click='changeTimeRange' class="ui button">3-Month</button>
    <button v-on:click='changeTimeRange' class="ui button">1-Month</button>
</div>
</template>

<script>
import dateFormat from 'dateformat';

export default {
    name: 'time-range-selector',
    methods: {
        changeTimeRange (e) {
            const newRange = e.target.textContent;
            let d = new Date();
            let beginningOfThisMonth = new Date();
            beginningOfThisMonth.setDate(1);
            const now = dateFormat(new Date(), "yyyymmddhh")
            const ranges = {
                'All': () => {
                    return ['1980010100', now]
                },
                '2-Year': () => {
                    d.setYear(d.getFullYear() - 2)
                    d.setMonth(d.getMonth() - 2)
                    return [dateFormat(d, "yyyymmddhh"), now]
                },
                '1-Year': () => {
                    d.setYear(d.getFullYear() - 1)
                    d.setMonth(d.getMonth() - 1)
                    return [dateFormat(d, "yyyymmddhh"), now]
                },
                '3-Month': () => {
                    d.setMonth(d.getMonth() - 4)
                    return [dateFormat(d, "yyyymmddhh"), now]
                },
                '1-Month': () => {
                    d.setMonth(d.getMonth() - 2)
                    return [dateFormat(d, "yyyymmddhh"), now]
                }
            }
            this.$emit('changeTimeRange', ranges[newRange]());
        }
    }
}
</script>


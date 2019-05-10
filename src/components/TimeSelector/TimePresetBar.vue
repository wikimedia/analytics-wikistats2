<template>
    <div class="timepresetbar ui equal width grid">
        <div v-for="range in rangeNames[structure]" class="column">
            <div @click=selectPeriod(range) :class="{selected: range.name === timeRange.timeKeyword}" class="ui label">{{formatRangeName(range)}}</div>
        </div>
    </div>
</template>
<script type="text/javascript">
    import TimeRange from 'Src/models/TimeRange';
    import { mapState } from 'vuex';
    export default {
        name: 'time-preset-bar',
        props: ['structure'],
        data () {
            return {
                rangeNames: {
                    timeseries: [
                        {
                            name: 'all',
                            granularity: 'monthly'
                        }, {
                            name: '2-year',
                            granularity: 'monthly'
                        }, {
                            name: '1-year',
                            granularity: 'monthly'
                        }, {
                            name: '3-month',
                            granularity: 'daily'
                        }, {
                            name: '1-month',
                            granularity: 'daily'
                        }
                    ],
                    top: [
                        {
                            name: 'last-month',
                            granularity: 'monthly'
                        }
                    ]
                }
            };
        },
        computed: mapState('detail', ['timeRange']),
        methods: {
            formatRangeName (range) {
                return range.name.replace('-', ' ');
            },
            selectPeriod (range) {
                const newRange = new TimeRange(range.name);
                this.$store.commit('detail/timeRange', { timeRange: newRange });
                this.$store.commit('detail/granularity', { granularity: range.granularity });
            }
        }

    }
</script>
<style scoped>
    .timepresetbar.ui.equal.width.grid {
        width: 95%!important;
        margin: 0 auto!important;
    }
    .timepresetbar .column {
        text-align: center;
        padding-left: 0.3rem!important;
        padding-right: 0.3rem!important;
    }
    .timepresetbar .column .ui.label {
        width: 100%;
        text-transform: capitalize;
    }

    .timepresetbar .column .ui.label.selected {
        background-color: #bbb;
    }

    .timepresetbar .column .ui.label:hover {
        background-color: #ccc;
        cursor: pointer;
    }
    .timepresetbar .column .ui.label:active {
        background-color: #aaa;
        cursor: pointer;
    }
</style>
<template>
    <div @mouseout="timeselectorBoxOut"
         @mousemove="timeselectorBoxIn"
         class="timeselectorBox"
         :style="{position:'absolute', top: timeSelectorPos.top + 'px', left: timeSelectorPos.left+ 'px'}">
        <p class="description">Select a time period for this metric:</p>
        <time-selector :width = "400"
                       :height = "25"
                       :graphModel = "graphModel"
                       :mode = "graphModel.config.structure"
                       :leftBound = "new Date(graphModel.config.knownStart || '2001-01-01')"
                       :rightBound = "new Date()"
                       :startDate = "timeRange.start"
                       :endDate = "timeRange.end"
                       :mainColor = "graphModel.config.darkColor"
                       :secondaryColor = "graphModel.config.lightColor"
                       @new-time = "timeChanged" />
        <time-preset-bar :structure="graphModel.config.structure"
                         :timeRange="timeRange"
                         :graphModel="graphModel"
                         @new-time = "timeChanged"
                         @new-granularity = "granularityChanged" />
    </div>
</template>
<script type="text/javascript">
    import TimeSelector from './TimeSelector';
    import TimeRange from 'Src/models/TimeRange';
    import TimePresetBar from './TimePresetBar';
    import { mapState } from 'vuex';
    export default {
        name: 'time-selector-tooltip',
        props: ['graphModel'],
        components: {TimeSelector, TimePresetBar},
        data(){
            return {
                gracePeriod: null
            }
        },
        computed: Object.assign(
            mapState([
                    'selectingTime'
            ]),
            mapState('detail', [
                    'timeRange'
            ]), {
                timeSelectorPos () {
                    const dateBox = $('.left.panel .time div');
                    const width = dateBox.width();
                    const timeBox = $('.timeselectorBox');
                    return {
                        top: dateBox.position().top - 22,
                        left: dateBox.position().left + width + 40
                    }
                }
            }
        ),
        methods: {
            timeChanged (time) {
                const newTimeRange = new TimeRange(time);
                if (time === 'all') {
                    const knownStart = this.graphModel.config.knownStart;
                    newTimeRange.start = new Date(knownStart);
                }
                this.$store.commit('detail/timeRange', { timeRange: newTimeRange });
            },
            granularityChanged (granularity) {
                this.$store.commit('detail/granularity', { granularity: granularity });
            },
            timeselectorBoxOut (e) {
                this.gracePeriod = setTimeout(() => {
                    this.gracePeriod = null;
                    const element = $('.timeselectorBox')[0];
                    if (!$(e.relatedTarget).parents().get().includes(element)) {
                        $(element).fadeOut(200, () => {
                            this.$store.commit('selectingTime', { selectingTime: false });
                        });
                    }
                }, 500);
            },
            timeselectorBoxIn () {
                if (this.gracePeriod) {
                    clearTimeout(this.gracePeriod);
                    this.gracePeriod = null;
                }
            },
        }
    }
</script>

<style>
div.timeselectorBox:before {
    content: ' ';
    height: 0;
    position: absolute;
    width: 0;
    left: -20px;
    top: 25px;
    border: 10px solid transparent;
    border-right-color: #fff;
}
.timeselectorBox {
    border: solid 1px #aaa;
    background-color: white;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0px 0px 20px -1px rgba(0,0,0,0.75);
}
.timeselectorBox .description {
    padding-left: 8px;
    padding-bottom: 8px;
    font-style: italic;
}
</style>
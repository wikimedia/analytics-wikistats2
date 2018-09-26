<template>
    <div v-if="graphModel" class="ui grid wikis" :class="{displaced: selectingTime}">
        <wiki-selector class="ui column seven wide" :single="false"></wiki-selector>
        <div @click="toggleTimeSelection" class="ui column calendarToggle">
            <i :class="{
                    'calendar large alternate outline': selectingTime,
                    'calendar large alternate': !selectingTime
            }" class="icon"></i>
        </div>
        <div class="ui column six wide selector" >
            <time-selector v-if = "selectingTime"
                           :width = "mobileTimeSelectorWidth || 150"
                           :height = "18"
                           :mode = "graphModel.config.structure"
                           :graphModel = "graphModel"
                           :leftBound = "new Date(graphModel.config.knownStart || '2001-01-01')"
                           :rightBound = "new Date(graphModel.config.knownEnd || timeRange.end)"
                           :startDate = "timeRange.start"
                           :endDate = "timeRange.end"
                           :mainColor = "graphModel.config.darkColor"
                           :secondaryColor = "graphModel.config.lightColor" />
        </div>
        <div v-if = "selectingTime" class="ui column granularity">
            <span @click="switchGranularity" class="ui label granularity">{{granularity[0]}}</span>
        </div>
    </div>
</template>
<script type="text/javascript">
    import WikiSelector from '../WikiSelector';
    import TimeSelector from '../TimeSelector';
    import { mapState } from 'vuex';
    export default {
        name: 'wiki-time-bar',
        props: ['graphModel'],
        components: {WikiSelector, TimeSelector},
        computed: Object.assign(
            mapState('detail', [
                'granularity',
                'timeRange'
            ]),
            mapState(['selectingTime']), {
            mobileTimeSelectorWidth () {
                return $('.ui.column.wide.selector').width();
            }
        }),
        methods: {
            toggleTimeSelection () {
                const toggled = !this.selectingTime;
                this.$store.commit('selectingTime', { selectingTime: toggled });
            },
            switchGranularity () {
                const granularities = ['monthly', 'daily'];
                const currentGranularityIndex = granularities.indexOf(this.graphModel.granularity);
                const nextGranularity = granularities[(currentGranularityIndex + 1) % granularities.length];
                this.$store.commit('detail/granularity', {granularity: nextGranularity});
            }
        }
    }
</script>
<style>
    .ui.column.wide.selector{
        margin-top: 10px;
    }
    .ui.grid.wikis {
        margin: 0;
    }
    .ui.column.wide.selector {
        margin-top: 0;
    }
    .ui.grid.wikis {
        width: 200vw;
        animation-name: slideout;
        animation-duration: 0.5s;
    }
    .ui.grid.wikis.displaced {
        animation-name: slidein;
        animation-duration: 0.5s;
        margin-left: -84vw!important;
    }
    @keyframes slidein {
        from {
          margin-left: 0;
        }
        to {
          margin-left: -84vw;
        }
    }
    @keyframes slideout {
        to {
          margin-left: 0;
        }
        from {
          margin-left: -84vw;
        }
    }
    .displaced.selector {
        display: initial;
    }
    .ui.grid.wikis .calendarToggle {
        width: 30px;
        line-height: 35px;
        padding-left: 2px;
        padding-right:0;
    }
    .ui.column.granularity {
        margin-top: 8px;
        padding-left: 0!important;
    }
    .ui.column.granularity .label{
        border: solid 0.5px #bbb!important;
        text-transform: uppercase;
    }
    .slider.text {
        font-size: 12px;
    }
</style>
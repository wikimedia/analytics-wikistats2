<template>
<section class="left panel sidebar" >
    <div class="wikis">
        <h3 class="header">Wiki</h3>
        <wiki-selector :single="false"></wiki-selector>
    </div>

    <wiki-button
        class="time toggle"
        @click="toggleTimeSelection"
        v-if="graphModel">
        <i class="calendar alternate icon"></i>
        {{formattedDateRange}}
    </wiki-button>

    <wiki-button
        class="time"
        @click="switchGranularity"
        v-if="graphModel && graphModel.graphData"
        :class="{disabled: graphModel.availableGranularities().length === 1 }">
        {{$t(`granularities-${graphModel.granularity}`)}}
    </wiki-button>

    <div class="ui clearing divider"></div>

    <h3 class="header">{{$t('detail_sidebar-metrics')}}</h3>
    <div class = 'metricsList'>
        <router-link v-for="o in otherMetrics" :key="o.name"
            :to="{project, area, metric: o.name}">
            <wiki-button
                :class="{pressed: o.name === metric}">
                {{$t(`metrics-${o.name}-name`)}}
            </wiki-button>
        </router-link>
    </div>

    <!--p v-if="otherMetrics.length > 1">
        <a @click.prevent="viewMoreMetrics" href="#">View more metrics</a>
    </p-->
    <div class="ui clearing divider"></div>
    <h3 class="header" v-hint:filterAndSplit>Filter/split</h3>
    <filter-split v-if="graphModel"/>
</section>
</template>

<script>
import { mapState } from 'vuex';

import WikiSelector from '../WikiSelector';
import FilterSplit from './filterSplit/FilterSplit';
import RouterLink from '../RouterLink';
import WikiButton from 'Src/components/WikiButton';

import utils from 'Src/utils'

import '../../../semantic/dist/components/modal';
import '../../../semantic/dist/components/dimmer';

export default {
    name: 'detail-sidebar',
    props: ['otherMetrics', 'graphModel'],
    data () {
        return {
            wiki: {
                language: {}
            },
        };
    },
    components: {
        WikiSelector,
        RouterLink,
        FilterSplit,
        WikiButton
    },
    computed: Object.assign(
        mapState([
            'project',
            'area',
            'metric',
            'selectingTime'
        ]),
        mapState('detail', [
            'timeRange',
        ]), {
            formattedDateRange () {
                const timeKeyword = this.timeRange.timeKeyword;
                if (timeKeyword) {
                    return this.$t(`time_range-${timeKeyword}`);
                }
                return this.graphModel.getFormattedTimeRange();
            }
    }),
    methods: {
        toggleTimeSelection () {
            const toggled = !this.selectingTime;
            this.$store.commit('selectingTime', { selectingTime: toggled });
        },
        switchGranularity () {
            const granularities = this.graphModel.availableGranularities();
            const currentGranularityIndex = granularities.indexOf(this.graphModel.granularity);
            const nextGranularity = granularities[(currentGranularityIndex + 1) % granularities.length];
            this.$store.commit('detail/granularity', {granularity: nextGranularity});
        }
    }
};
</script>

<style>
.ui.line.label {
    display: table;
    margin: 3px;
    background-color: #fefefe;
    border: solid 2px #cdcdcd;
    font-size: 13px;
    font-weight: 500;
    color: #54595d!important;
    padding: 5px 9px;
    cursor: pointer;
}
.ui.line.label.router-link-current {
    background-color: #a7a7a7!important;
    border: solid 2px #979797!important;
    font-weight: bold;
    color: #222!important;
}
.left.panel.sidebar {
    background-color: #D8D8D8;
    min-width: 242px;
    max-width: 280px;
    padding: 1em;
}
.left.panel h3.header {
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 6px 0;
}
.left.panel p {
    margin-top: 8px;
}
.left.panel .ui.clearing.divider {
    margin-bottom: 2px;
}
.time {
    margin-top: 6px;
    text-transform: capitalize;
}

.metricsList a {
    display: block;
    margin-top: 6px;
}
</style>

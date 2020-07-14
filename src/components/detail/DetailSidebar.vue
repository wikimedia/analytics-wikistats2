<template>
<section class="left panel sidebar" >
    <div class="wikis">
        <h3 class="header">Wiki</h3>
        <wiki-selector :single="false"></wiki-selector>
    </div>

    <div class="time" v-if="graphModel">
        <div @click="toggleTimeSelection" class="ui label">
            <i class="calendar alternate icon"></i>
            {{formattedDateRange}}
        </div>
    </div>
    <div class="time" v-if="graphModel">
        <div @click="switchGranularity" :class="{untoggle: graphModel.availableGranularities().length === 1 }" v-if="graphModel && graphModel.graphData" class="ui label">{{$t(`granularities-${graphModel.granularity}`)}}</div>
    </div>

    <div class="ui clearing divider"></div>

    <h3 class="header">{{$t('detail_sidebar-metrics')}}</h3>

    <router-link v-for="o in otherMetrics" :key="o.name"
        :to="{project, area, metric: o.name}"
        class="ui line label">
        {{$t(`metrics-${o.name}-name`)}}
    </router-link>

    <!--p v-if="otherMetrics.length > 1">
        <a @click.prevent="viewMoreMetrics" href="#">View more metrics</a>
    </p-->
    <div class="ui clearing divider"></div>
    <breakdowns :graphModel="graphModel" v-if="graphModel && graphModel.config.structure === 'timeseries' && graphModel.splittingAllowed(project)"/>
</section>
</template>

<script>
import { mapState } from 'vuex';

import WikiSelector from '../WikiSelector';
import Breakdowns from './Breakdowns';
import RouterLink from '../RouterLink';

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
        Breakdowns,
        RouterLink,
    },
    computed: Object.assign(
        mapState([
            'project',
            'area',
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
    margin-top: 5px;
}
.time > .ui.label {
    cursor: pointer;
    border: solid 0.5px #999;
    text-transform: capitalize;
}
.time > .ui.label.untoggle {
    cursor: default;
    background-color: #E8E8E8;
    border: none;
}
.time > div:hover {
    background-color: #ccc;
}
</style>

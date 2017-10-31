<template>
<section class="left panel" >
    <div class="wikis">
        <h3 class="header">Wiki</h3>
        <wiki-selector :single="false"></wiki-selector>
    </div>

    <div class="ui clearing divider"></div>

    <h3 class="header">Metrics</h3>

    <router-link v-for="o in otherMetrics" :key="o.name"
        :to="{project: $store.state.project, area, metric: o.name}"
        class="ui line label">
        {{o.fullName}}
    </router-link>

    <!--p v-if="otherMetrics.length > 1">
        <a @click.prevent="viewMoreMetrics" href="#">View more metrics</a>
    </p-->

    <breakdowns v-if="graphModel && graphModel.breakdowns" :graphModel = "graphModel"/>
</section>
</template>

<script>
import WikiSelector from '../WikiSelector';
import Breakdowns from './Breakdowns';
import sitematrix from '../../apis/sitematrix';
import RouterLink from '../RouterLink';

import '../../../semantic/dist/components/modal';
import '../../../semantic/dist/components/dimmer';

export default {
    name: 'detail-sidebar',
    props: ['otherMetrics','metric','graphModel','area'],
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
    methods: {
        viewMoreMetrics () {
            $('.ui.metrics.modal', this.$el).modal('show');
        },
    }
};
</script>

<style>
.left.panel {
    background-color: #D8D8D8;
    min-width: 242px;
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
.left.panel .wikis {
    min-height: 120px;
}
.left.panel .ui.icon.input > input {
    width: 204px;
    height: 36px;
    font-size: 13px!important;
    border: 1px solid #aaa9a9!important;
    border-radius: 4px;
    padding-right: 32px!important;
}
</style>

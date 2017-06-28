<template>
<section class="left panel" >
    <div class="wikis">
        <h3 class="header">Wiki</h3>
        <wiki-selector :wiki="wiki" :single="false" @wikiSelected="wikiSelected"></wiki-selector>
    </div>

    <div class="ui clearing divider"></div>

    <h3 class="header">Metrics</h3>

    <router-link v-for="o in otherMetrics" :key="o.name"
                 :to="'/' + area + '/' + o.name"
                 class="ui line label"
                 :class="{active: o.name === metric}">
        {{o.fullName}}
    </router-link>

    <p>
        <a @click.prevent="viewMoreMetrics" href="#">View more metrics</a>
    </p>

    <breakdowns :breakdowns='breakdowns'/>
</section>
</template>

<script>
import WikiSelector from '../WikiSelector'
import Breakdowns from './Breakdowns'

import '../../../semantic/src/definitions/modules/modal'
import '../../../semantic/src/definitions/modules/dimmer'

export default {
    name: 'detail-sidebar',
    props: ['wiki','otherMetrics','metric','breakdowns','area'],
    components: {
        WikiSelector,
        Breakdowns
    },
    methods: {
        wikiSelected (wiki) {
            this.$emit('wikiSelected', wiki);
        },

        viewMoreMetrics () {
            $('.ui.metrics.modal', this.$el).modal('show')
        },
    }
}
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
.left.panel .ui.icon.input {
    width: 204px;
}
.left.panel .ui.icon.input > input {
    height: 36px;
    font-size: 13px!important;
    border: 1px solid #aaa9a9!important;
    border-radius: 4px;
    padding-right: 32px!important;
}
</style>

<template>
<span>
    <span v-if="breakdown">
        <span v-for="b, i in breakdown.values" v-if="b.on">
            <span class="color swatch"
                  :style="{ 'background-color': getColor(b.key) }"></span>
            {{$t(geti18nBreakdownKey(b.key)) | capitalize}}
        </span>
    </span>
</span>
</template>

<script>
import config from '../../config'

export default {
    name: 'simple-legend',
    props: ['breakdown', 'graphModel'],
    methods: {
        getColor (key) {
            return config.getColorForBreakdown(this.breakdown, key, this.$store.state.area);
        },
        geti18nBreakdownKey (key) {
            if (key === 'total') return 'general-total';
            return `metrics-${this.graphModel.metricId}-breakdowns-${this.breakdown.breakdownName}-values-${key}-name`;
        },
    }
}
</script>

<style>
.color.swatch {
    width: 10px;
    height: 11px;
    display: inline-block;
    margin-left: 4px;
    margin-right: 2px;
}
</style>

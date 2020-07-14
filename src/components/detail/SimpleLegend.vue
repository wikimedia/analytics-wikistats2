<template>
<span>
    <span v-if="dimension">
        <span v-for="b, i in dimension.values" v-if="b.on">
            <span class="color swatch"
                  :style="{ 'background-color': getColor(b.key) }"></span>
            {{$t(geti18nBreakdownKey(b.key)) | capitalize}}
        </span>
    </span>
</span>
</template>

<script>
import config from '../../config';
import { mapGetters } from 'vuex';

export default {
    name: 'simple-legend',
    props: ['dimension', 'graphModel'],
    computed: mapGetters('dimensions', [
        'colorForDimensionValue'
    ]),
    methods: {
        getColor (key) {
            return this.colorForDimensionValue(key, this.$store.state.area);
        },
        geti18nBreakdownKey (key) {
            if (key === 'total') return 'general-total';
            return `metrics-${this.graphModel.metricId}-breakdowns-${this.dimension.key}-values-${key}-name`;
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

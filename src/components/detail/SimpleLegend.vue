<template>
<span>
    <span v-if="breakdown">
        <span v-for="b, i in breakdown.values" v-if="b.on">
            <span class="color swatch"
                  :style="{ 'background-color': getColor(b.key) }"></span>
            {{b.name | capitalize}}
        </span>
    </span>
</span>
</template>

<script>
import config from '../../config'

export default {
    name: 'simple-legend',
    props: ['breakdown'],
    methods: {
        getColor (key) {
            return config.getColorForBreakdown(this.breakdown, key, this.$store.state.area);
        }
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
.simple.legend {
    margin-right: 10px;
    margin-top: 5px;
    display: inline-block;
}
</style>

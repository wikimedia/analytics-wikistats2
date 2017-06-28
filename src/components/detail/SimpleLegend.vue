<template>
<span>
    <span v-if="data.breakdowns && data.breakdowns[0].on">
        <span v-for="b, i in data.breakdowns[0].values" v-if="b.on">
            <span class="color swatch"
                  :style="{ 'background-color': colors[ci[b.name]] }"></span>
            {{b.name}}
        </span>
    </span>
</span>
</template>

<script>
import config from '../../apis/Configuration'

export default {
    name: 'simple-legend',
    props: ['data'],

    data () {
        return {
            ci: config.stableColorIndexes
        }
    },

    computed: {
        colors: function () {
            return config.colors[this.data.area]
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
</style>

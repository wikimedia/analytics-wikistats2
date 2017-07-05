<template>
<div class="area" :class="area.id">
    <div class="ui top attached header">
        {{area.name}}
    </div>
    <div class="ui attached basic segment">
        <div class="ui three column grid">
            <metric-widget
                v-for="m in area.metrics"
                :key="m"
                :metric="{ name: m }"
                :area="area.id">
            </metric-widget>
        </div>
    </div>
</div>
</template>

<script>
import MetricWidget from './MetricWidget'

export default {
    name: 'dashboard-area',
    props: ['area'],

    components: {
        MetricWidget,
    },
}
</script>

<style scoped>
.area .ui.top.attached.header {
    background-color: #E8E8E8;
    color: #4A4A4A;
    font-size: 18px;
    font-weight: normal;
    padding: 7px 21px;
}

.area .header { border: none; }
.area.contributing .header { border-bottom: 2px solid #C4CDDF; }
.area.reading .header { border-bottom: 2px solid #B8E9DE; }
.area.content .header { border-bottom: 2px solid #FFF1C6; }

.ui.attached.basic.segment { border: none; }

.contributing { }
.reading {}
.content {}
</style>

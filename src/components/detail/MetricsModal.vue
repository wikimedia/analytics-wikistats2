<template>
<div class="ui metrics modal">
    <i class="close icon"></i>
    <div class="header">
        All Metrics
        <div class="subdued">Select a metric to visualize and explore its data</div>
    </div>
    <div class="ui three column grid">
        <div class="column" v-for="a in areasWithMetrics">
            <h4 :class="a.name" :style="{ borderBottom: '2px solid ' + a.color }">{{a.name}}</h4>
            <div v-for="m in a.metrics" :key="m.name"
                         class="ui line label"
                         :class="{active: m.name === highlightMetric.name}"
                         @click="changeHighlight(m.name, a.name)">
                {{m.fullName}}
            </div>
        </div>
    </div>
    <div class="actions">
        <div class="ui blue button" @click="goHighlight">Go</div>
    </div>
</div>
</template>

<script>

export default {
    name: 'metrics-modal',
    props: ['areasWithMetrics', 'highlightMetric'],
    methods: {
        changeHighlight (name, area) {
            this.highlightMetric = { name, area }
        },

        goHighlight (area) {
            const h = this.highlightMetric
            this.$emit('changeMetric', area)
            $('.ui.metrics.modal').modal('hide')
        }
    }
}
</script>

<style>
.ui.metrics.modal {
    /* width: 685px; looks a little better bigger */
    width: 780px;
    left: 700px;
}
.ui.metrics.modal .header {
    font-weight: bold;
    border: none;
    padding-bottom: 10px;
}
.ui.metrics.modal .actions {
    border: none;
    background-color: #fff;
}
.ui.metrics.modal .ui.grid {
    padding: 14px 28px;
}

.ui.metrics.modal i.close.icon {
    position: relative;
    top: initial;
    right: initial;
    float: right;
    color: #bababa;
}
.ui.metrics.modal .header .subdued {
    font-size: 13px;
    font-weight: normal;
}

.ui.metrics.modal .column h4 {
    text-transform: capitalize;
    font-size: 17px;
    padding-bottom: 4px;
    margin-bottom: 8px;
}
.ui.blue.button {
    background-color: #3366cc!important;
    width: 78px;
}
</style>
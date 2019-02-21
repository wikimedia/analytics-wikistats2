<template>
    <div>
        <metric-list-widget
            :data="graphData"
            v-if="graphModel.config.structure === 'top'"
            :graphModel="graphModel">
        </metric-list-widget>
        <metric-bar-widget
            v-else-if="graphModel.config.additive"
            :data="graphData"
            :graphModel="graphModel" />
        <metric-line-widget
            v-else
            :data="graphData"
            :graphModel="graphModel" />
    </div>
</template>
<script type="text/javascript">
    import MetricBarWidget from './MetricBarWidget';
    import MetricLineWidget from './MetricLineWidget';
    import MetricListWidget from './MetricListWidget';
    export default {
        name: 'widget-chart',
        components: {
            MetricBarWidget,
            MetricLineWidget,
            MetricListWidget
        },
        props: ['graphModel', 'graphData']
     }
</script>
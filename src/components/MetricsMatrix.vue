<template>
    <div class='metricsmatrix'>
        <h1>
            All Wikistats metrics
        </h1>
        <div class="ui grid stackable">
          <div class="three column row">
            <div class="column" v-for="(metrics, areaName) in metricsByArea">
                <h2>{{areaName}}</h2>
                <div v-for="(metric, metricName) in metrics" class="metric">
                    <router-link :key="metricName"
                        :to="{project, area: areaName, metric: metricName}"
                        :disabled="disabledMessage(metric)"
                        class="ui line label"
                        v-hint:raw="disabledMessage(metric) || metric.tooltip"
                        :class="{wikistats1: metric.wikistats1URL, notavailable: disabledMessage(metric)}">
                        {{metric.fullName}}
                        <img v-if="metric.wikistats1URL" class="wikimedia-logo" src="//upload.wikimedia.org/wikipedia/commons/f/f3/Wikimedia-logo-V.svg" alt="wikimedia-logo">
                    </router-link>
                </div>
            </div>
          </div>
        </div>
        <div class= "wikistats1box">
            <div class="box">
                <div class="logo"><img class="wikimedia-logo" src="//upload.wikimedia.org/wikipedia/commons/f/f3/Wikimedia-logo-V.svg" alt="wikimedia-logo"></div>
                <div class="text">
                    Metrics marked with the Wikimedia logo have the same filtering and parameters as the ones shown in Wikistats 1.<br/>
                    <i><a href="https://www.mediawiki.org/wiki/Analytics/Wikistats/DumpReports/Future_per_report" target="_blank">Learn more about the differences between the old and new Wikistats metrics</a></i>
                </div>
            </div>
        </div>
    </div>
</template>
<script scoped type="text/javascript">
    import config from 'Src/config';
    import RouterLink from 'Src/components/RouterLink';
    import utils from 'Src/utils';
    import StatusOverlay from 'Src/components/StatusOverlay';
    import { mapState } from 'vuex';
    export default {
        name: 'metrics-matrix',
        components: {
            RouterLink
        },
        computed: Object.assign(
            mapState([
                'project',
            ]),{
                metricsByArea () {
                    const areas = {};
                    Object.keys(config.metrics).forEach(metricName => {
                        const metric = config.metrics[metricName];
                        areas[metric.area] = areas[metric.area] || {};
                        areas[metric.area][metricName] = metric;
                    });
                    return areas;
                }
            }
        ),
        methods: {
            disabledMessage (metric) {
                let message;
                if (!metric.global && this.project === config.ALL_PROJECTS) {
                    message = StatusOverlay.NON_GLOBAL(metric.fullName).text;
                } else if (!metric.globalFamily && utils.isProjectFamily(this.project)) {
                    message = StatusOverlay.NON_GLOBAL_FAMILY(metric.fullName, this.project).text;
                }
                return message;
            }
        }
    }
</script>
<style scoped>
    .metricsmatrix {
        padding-top: 20px;
    }
    @media(max-width: 500px) {
        .metricsmatrix h1 {
            padding-left: 1rem;
        }
    }
    .metricsmatrix .metric .ui.line.label {
        font-size: 13px!important;
        border: solid 1px #cdcdcd!important
    }
    .metricsmatrix .metric .ui.line.label .wikimedia-logo {
        width: 18px!important;
        height: 18px!important;
        vertical-align: text-bottom!important;
        margin-left: 3px;
    }
    .metricsmatrix .metric .ui.line.label.wikistats1 {
        background-color: #FFFFDD;
    }
    .metricsmatrix .metric .ui.line.label.router-link-current {
        background-color: #a7a7a7!important;
        border: solid 1px #979797!important;
        font-weight: bold;
        color: #222!important;
    }
    .metricsmatrix .metric {
        margin-bottom: 5px;
    }
    .metricsmatrix h1{
        font-size: 30px;
        font-weight: normal;
    }
    .metricsmatrix h2{
        font-size: 24px;
        color: #3366CC;
        font-weight: normal;
        text-transform:capitalize;
        margin-bottom: 20px;
    }
    .wikistats1box{
        width: 100%;
        margin-top: 30px;
        padding-left: 30px;
        padding-right: 30px;
        padding-bottom: 20px;
    }
    .wikistats1box .box{
        margin: 0 auto;
        max-width: 611px;
        background-color: #FFFFDD;
        display:flex;
        padding: 10px;
        border: solid 1px #979797;
        border-radius: 3px;
    }
    .wikistats1box .box .logo{
        min-width: 35px;
        flex: 0 0 6%;
    }
    .wikistats1box .box .text{
        flex: 1;
    }
    .wikistats1box .box .wikimedia-logo{
        width: 30px;
        height: 30px;
    }
    .notavailable {
        cursor: not-allowed!important;
        font-style: italic;
        color: #bbb!important;
    }
</style>
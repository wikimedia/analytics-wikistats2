<template>
    <div class="ui floating dropdown button" @click="toggleVisibility()">
        <span class="text metric name">{{metric.fullName}}</span> <span class="granularity subdued">{{granularity}}</span>
        <i class="dropdown icon"></i>
        <div class="menu" v-bind:class="{shown: visible, hidden: !visible}">
            <div class="marea">Reading</div>
            <div v-for="m in metrics.reading" @click="goToMetric(m.area, m.name)" :data-value="m.name" class="item" :class="active(m)">
                {{m.fullName}}
            </div>
            <div class="divider"></div>
            <div class="marea">Contributing</div>
            <div v-for="m in metrics.contributing" @click="goToMetric(m.area, m.name)" :data-value="m.name" class="item" :class="active(m)">
                {{m.fullName}}
            </div>
            <div class="divider"></div>
            <div class="marea">Content</div>
            <div v-for="m in metrics.content" @click="goToMetric(m.area, m.name)" :data-value="m.name" class="item" :class="active(m)">
                {{m.fullName}}
            </div>
        </div>
    </div>
</template>

<script type="text/javascript">
import config from "../config";
export default {
    name: "metrics-dropdown",
    props: ['granularity', 'metric'],
    data() {
        return {
            visible: false,
            metrics: Object.keys(config.metrics).reduce(
                (p, metricName) => {
                    const metric = config.metrics[metricName];
                    metric.name = metricName;
                    p[metric.area].push(metric);
                    return p;
                },
                { reading: [], contributing: [], content: [] }
            )
        };
    },
    methods: {
        active (metric) {
            return metric === this.metric? 'active': '';
        },
        toggleVisibility (){
            this.visible = !this.visible;
        },
        goToMetric(area, metric) {
            if (metric !== this.metric.name)
            this.$store.commit('reload', {
                project: this.$store.state.project,
                metric: metric,
                area: area
            });
        }
    }
};

</script>

<style type="text/css">
.marea {
    line-height: 30px;
    margin-left: 8px;
}
.ui.floating.dropdown.button {
    width: calc(100vw - 3em);
    background: #f8f8f8;
}
.dropdown.icon {
    float: right;
}
.text.metric.name {
    font-size: 15px;
    font-weight: bold;
}
.granularity {
    font-style: italic;
    font-weight: 100;
}
.menu.hidden {
    display: none;
}
.menu.shown {
    display: block!important;
    opacity: 1;
    animation-name: fadeInOpacity;
    animation-duration: 0.5s;
    max-height: 70vh;
    overflow: scroll;
    overflow-x: hidden;
}

@keyframes fadeInOpacity {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
</style>

<template>
<div class="area" :class="area.id">
    <div class="ui top attached header">
        {{area.name}}
    </div>
    <div class="ui attached basic segment">
        <div :class="gridClass"
            class="ui column grid"
            v-touch:swipe.left="onLeftSwipe"
            v-touch:swipe.right="onRightSwipe">
            <metric-widget
                v-for="(m, i) in availableMetrics"
                v-if="!isPending(i)"
                :key="m[0]"
                :metrics="m"
                :position="i"
                :parentWidgetCount="getAvailableMetricSlots(deferredWidth)"
                :parentMetricCount="availableMetrics.length">
            </metric-widget>
        </div>
    </div>
</div>
</template>

<script>
import MetricWidget from './MetricWidget';
import { mapState } from 'vuex';
import config from '../../config';

const globalProjects = {
    global: config.wikiGroups.filter(g => !(g.family)).map(g => g.code),
    globalFamily: config.wikiGroups.filter(g => g.family).map(g => g.code),
};

export default {
    name: 'dashboard-area',
    props: ['area'],
    data() {
        return {
            carouselSteps: 0,
            resizeTimer: null,
            deferredWidth: 1024
        };
    },

    watch: {
        width() {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.deferredWidth = this.width;
            }, 200);
        }
    },

    methods: {
        getAvailableMetricSlots(width) {
            const DEFAULT_CARD_SIZE = 316;
            const MIN_DESKTOP_APP_WIDTH = 1024;
            const SIDE_PADDING = 56;

            const devicePixelRatio =  window.devicePixelRatio || 0;

            width = width / Math.max(1, devicePixelRatio -1);

            width = Math.round(width);

            let availableSlots = 1;

            if (width >= MIN_DESKTOP_APP_WIDTH) {
                availableSlots = Math.floor(width / DEFAULT_CARD_SIZE);
            } else if (
                width - SIDE_PADDING >
                2 * (MIN_DESKTOP_APP_WIDTH - SIDE_PADDING) / 3
            ) {
                availableSlots = 2;
            }

            return availableSlots;
        },
        isPending(i) {
            return !(
                i <
                    this.getAvailableMetricSlots(this.deferredWidth) +
                        this.carouselSteps && i >= this.carouselSteps
            );
        },
        onLeftSwipe(){
            this.carouselSteps = Math.min(this.carouselSteps + 1, this.availableMetrics.length - 1);
        },
        onRightSwipe(){
            this.carouselSteps = Math.max(this.carouselSteps - 1, 0);
        }

    },

    computed: Object.assign(mapState([
        'project',
        'width',
    ]), {
        gridClass() {
            return {
                1: 'one',
                2: 'two',
                3: 'three',
                4: 'four'
            }[this.getAvailableMetricSlots(this.deferredWidth)];
        },
        notGlobal () {
            return globalProjects.global.indexOf(this.project) < 0;
        },
        notGlobalFamily () {
            return globalProjects.globalFamily.indexOf(this.project) < 0;
        },
        mobile () {
            return this.$mq === 'mobile';
        },
        availableMetrics() {
            const metricGroups = [];
            this.area.metrics.forEach(metricOrGroup => {
                const group = (
                    config.metricGroups[metricOrGroup] || [metricOrGroup]
                ).filter(m => {
                    const c = config.metricConfig(m);
                    return !(this.mobile) || (
                               (c.global || this.notGlobal) &&
                               (c.globalFamily || this.notGlobalFamily)
                           );
                });

                if (group && group.length) {
                    metricGroups.push(group);
                }
            });
            return metricGroups;
        }
    }),
    mounted () {
        this.deferredWidth = this.width;
    },

    components: {
        MetricWidget
    }
};
</script>

<style scoped>
.area .ui.top.attached.header {
    background-color: #eaecf0;
    color: #222;
    font-size: 18px;
    font-weight: normal;
    padding: 7px 21px;
}
.ui.column.grid {
    flex-wrap: nowrap;
}

.area .header {
    border: none;
}
.area.contributing .header {
    border-bottom: 2px solid #D4E6F1;
}
.area.reading .header {
    border-bottom: 2px solid #D1F2EB;
}
.area.content .header {
    border-bottom: 2px solid #F9E79F;
}

.ui.attached.basic.segment {
    border: none;
}

.contributing {
}
.reading {
}
.content {
}

@media (max-width: 450px) {
    .area {
        margin: 1em;
    }
    .ui.attached.basic.segment {
        margin: 0;
    }
}
</style>

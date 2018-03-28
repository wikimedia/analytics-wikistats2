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
                v-for="(m, i) in area.metrics"
                v-if="!isPending(i)"
                :key="m"
                :metric="{ name: m }"
                :area="area.id"
                :position="i"
                :parentWidgetCount="getAvailableMetricSlots(width)">
            </metric-widget>
        </div>
    </div>
</div>
</template>

<script>
import MetricWidget from './MetricWidget';
import { mapState } from 'vuex';

export default {
    name: 'dashboard-area',
    props: ['area'],
    data() {
        return {
            carouselSteps: 0,
            resizeTimer: null,
            width: 1024
        };
    },

    watch: {
        appWidth() {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.width = this.appWidth;
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
                    this.getAvailableMetricSlots(this.width) +
                        this.carouselSteps && i >= this.carouselSteps
            );
        },
        onLeftSwipe(){
            this.carouselSteps = Math.min(this.carouselSteps + 1, this.area.metrics.length - 1);
        },
        onRightSwipe(){
            this.carouselSteps = Math.max(this.carouselSteps - 1, 0);
        }

    },

    computed: {
        appWidth: mapState([
            'width'
        ]).width,
        gridClass() {
            return {
                1: 'one',
                2: 'two',
                3: 'three',
                4: 'four'
            }[this.getAvailableMetricSlots(this.width)];
        }
    },
    mounted () {
        this.width = this.appWidth;
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
    border-bottom: 2px solid #c4cddf;
}
.area.reading .header {
    border-bottom: 2px solid #b8e9de;
}
.area.content .header {
    border-bottom: 2px solid #fff1c6;
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

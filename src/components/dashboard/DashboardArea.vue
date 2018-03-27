<template>
<div class="area" :class="area.id">
    <div class="ui top attached header">
        {{area.name}}
    </div>
    <div class="ui attached basic segment">
        <div :class="gridClass" class="ui column grid">
            <metric-widget
                v-for="m in area.metrics.slice(0, getAvailableMetricSlots(width))"
                :key="m"
                :metric="{ name: m }"
                :area="area.id">
            </metric-widget>
        </div>
    </div>
</div>
</template>

<script>
import MetricWidget from './MetricWidget';

export default {
    name: 'dashboard-area',
    props: ['area'],
    data() {
        return {
            width: this.$store.state.width,
            resizeTimer: null //I don't like this.
        };
    },

    watch: {
        '$store.state.width'() {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.width = this.$store.state.width;
            }, 200);
        }
    },

    methods: {
        getAvailableMetricSlots(width) {
            const DEFAULT_CARD_SIZE = 316;
            const MIN_DESKTOP_APP_WIDTH = 1024;
            const SIDE_PADDING = 56;

            width = width / Math.max(1, window.devicePixelRatio - 1);

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
        }

    },

    computed: {
        gridClass() {
            return {
                1: 'one',
                2: 'two',
                3: 'three',
                4: 'four'
            }[this.getAvailableMetricSlots(this.width)];
        }
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

@media(max-width: 450px) {
    .area {
        margin: 1em;
    }
    .ui.attached.basic.segment {
        margin: 0;
    }
}
</style>

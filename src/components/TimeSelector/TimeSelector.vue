<template>
    <svg
        @click="onClick"
        @mousemove="onMouseMove"
        @touchmove="onMouseMove"
        @mouseup="onMouseUp"
        @touchend="onMouseUp"
        @touchleave="onMouseUp"
        @touchcancel="onMouseUp"
        @mousedown="onDragStart"
        @touchstart="onDragStart"
        class='timeselector' :height='height * 2' :width='width'>
      <g>
        <component :is="coverType(loading)"
            v-if="mode==='timeseries'"
            :left="left"
            :right="right"
            :color="secondaryColor"
            :height="height - 4" />
        <rect class = 'mainRect' :x="margin / 2" y="20" rx="2" ry="2" :width="width-margin" :height="height - 4" />
        <g v-if="mode==='timeseries'">
            <text v-if="start" unselectable="on" class = 'slider text left' :x="textPosition(left, 'left')" y="10">{{sliderRange()[0]}}</text>
            <rect class = 'slider left' :x="left" y="18" rx="2" ry="2" :width="sliderWidth" :height="height" />

            <text v-if="anchorSeparation > 0" unselectable="on" class = 'slider text hyphen' :x="(textPosition(right, 'right') + textPosition(left, 'left'))/2" y="10">-</text>

            <text v-if="end" unselectable="on" class = 'slider text right' :x="textPosition(right, 'right')" y="10">{{sliderRange()[1]}}</text>
            <rect class = 'slider right' :x="right" y="18" rx="2" ry="2" :width="sliderWidth" :height="height"/>
        </g>
        <g v-else>
            <text v-if="end" unselectable="on" class='slider text right' :x="right" y="10">{{sliderRange()}}</text>
            <rect class='slider right' :x="right" y="18" rx="2" ry="2" :width="sliderWidth" :height="height"/>
        </g>
      </g>
    </svg>
</template>

<script>
import * as d3 from 'd3-selection';
import * as scales from 'd3-scale';
import dateFormat from 'dateformat';
import Vue from 'vue';
import { mapState } from 'vuex';
import utils from '../../utils';

import TimeRange from 'Src/models/TimeRange';
import SelectedCover from './SelectedCover';
import SelectedCoverLoading from './SelectedCoverLoading';
const TimeSelector = {
    name: 'time-selector',
    props: [
        'leftBound',
        'rightBound',
        'width',
        'startDate',
        'endDate',
        'mainColor',
        'secondaryColor',
        'mode',
        'graphModel',
        'height',
    ],
    components: { SelectedCover, SelectedCoverLoading },
    data () {
        return {
            start: null,
            end: null,
            right: 0,
            left: null,
            dragging: {
                left: false,
                right: false
            },
            margin: this.graphModel.granularity === 'monthly' ? 70 : 82,
            sliderWidth: 10
        };
    },
    mounted() {
        this.start = this.startDate;
        this.end = this.endDate;
        this.right = this.timeToX(this.end);
        if (this.mode !== 'top') {
            this.left = this.timeToX(this.start);
        }
    },
    computed: Object.assign(mapState('detail', ['timeRange']), {
        loading () {
            return !!this.graphModel.status;
        },
        anchorSeparation () {
            const granularity = this.graphModel.granularity;
            const threshold = granularity === 'monthly' ? 70 : 82;
            const distance = this.right - this.left;
            const margin = 2;
            if (distance < threshold / 2 + threshold / 2) {
                return (threshold / 2 + threshold / 2 - distance) / 2 + 2;
            }
            return 0;
        }
    }),
    watch: {
        timeRange () {
            this.start = this.timeRange.start;
            this.end = this.timeRange.end;
            this.left = this.timeToX(this.timeRange.start);
            this.right = this.timeToX(this.timeRange.end);
        }
    },
    methods: {
        textPosition (x, side) {
            const margin = 12;
            if (side === 'left'){
                const rightElement = $('.slider.text.right');
                let width = 0;
                if (rightElement.length > 0) {
                    width = rightElement[0].textLength.baseVal.value;
                }
                return Math.max(40, Math.min(x - this.anchorSeparation, this.width - margin - 40 - width));
            } else {
                const leftElement = $('.slider.text.left');
                let width = 0;
                if (leftElement.length > 0) {
                    width = leftElement[0].textLength.baseVal.value;
                }
                return Math.max(40 + margin + width, Math.min(x + this.anchorSeparation, this.width - 40));
            }
        },
        setLeft (left) {
            this.left = Math.min(
                this.right,
                Math.max(this.margin / 2, left)
            );
        },
        setRight (right) {
            if (this.mode === 'timeseries') {
                this.right = Math.max(
                    Math.max(this.margin / 2, this.left),
                    Math.min(right, this.width - this.margin / 2)
                );
            } else {
                this.right = Math.max(this.margin / 2,
                    Math.min(right, this.width - this.margin / 2)
                );
            }
        },
        coverType(loading) {
            return loading ? 'selected-cover-loading' : 'selected-cover';
        },
        timeToX(time) {
            return scales
                .scaleLinear()
                .domain([this.leftBound, this.rightBound])
                .range([this.margin / 2, this.width - this.margin / 2])(time);
        },
        xToTime(x) {
            return scales
                .scaleLinear()
                .domain([this.margin / 2, this.width - this.margin / 2])
                .range([this.leftBound, this.rightBound])(x);
        },
        onClick(e) {
            e.stopPropagation();
        },
        onDragStart(e) {
            if (e.target.classList.contains('left')) {
                this.dragging.left = true;
            } else if (e.target.classList.contains('right')) {
                this.dragging.right = true;
            }
        },
        onMouseMove(e) {
            const currentTransformationMatrix = this.$el.getScreenCTM();
            if (e.touches) e = e.touches[0];
            if (this.dragging.left) {
                const computedLeftPosition =
                    (e.clientX - currentTransformationMatrix.e) /
                    currentTransformationMatrix.a;
                this.setLeft(computedLeftPosition);
                this.start = this.xToTime(this.left);
            } else if (this.dragging.right) {
                const computedRightPosition =
                    (e.clientX - currentTransformationMatrix.e) /
                    currentTransformationMatrix.a;
                this.setRight(computedRightPosition)
                this.end = this.xToTime(this.right);
                this.mode === 'top' && this.setStartForTops();
            }
        },
        onMouseUp(e) {
            if (this.dragging.left) {
                this.dragging.left = false;
                this.reportChange();
            } else if (this.dragging.right) {
                this.dragging.right = false;
                this.reportChange();
            }
        },
        reportChange() {
            const newTimeRange = new TimeRange([this.start, this.end]);
            this.$store.commit('detail/timeRange', { timeRange: newTimeRange });
        },
        sliderRange() {
            if (this.mode === 'timeseries') {
                return [
                    TimeRange.dateFormatForGranularity(this.start, this.graphModel.granularity),
                    TimeRange.dateFormatForGranularity(this.end, this.graphModel.granularity)
                ]
            } else {
                return TimeRange.dateFormatForGranularity(
                    new TimeRange([this.start, this.end]).getMidDate(),
                    this.graphModel.granularity
                );
            }
        },
        setStartForTops(){
            const endCopy = new Date(this.end);
            if (this.graphModel.granularity === 'monthly') {
                endCopy.setUTCDate(endCopy.getUTCDate() - 1);
            } else {
                endCopy.setUTCHours(0);
            }
            this.start = endCopy
        }
    }
};

export default TimeSelector;
</script>

<style>
rect.slider {
    cursor: move;
    fill: #222;
    stroke: #555;
    stroke-width: 1px;
}
rect.slider:hover {
    fill: #555;
}
.slider.text {
    fill: #000;
    stroke: none;
    text-anchor: middle;
    user-select: none;
}
.mainRect {
    fill: transparent;
    stroke: black;
    stroke-width: 1;
    opacity: 0.5;
}
</style>

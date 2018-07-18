<template>
    <div v-if="scale" class="map legend">
        <h4 class="title">{{title}}</h4>
        <svg>
            <rect v-for="(bound, i) in boundaries.slice(0, boundaries.length - 1)"
                  :style="{fill: scale(boundaries[i + 1])}"
                  :x="padding + i * boxSize"
                  :y="0"
                  :width="boxSize"
                  :height="boxHeight"
            />
            <text v-for="(bound, i) in boundaries"
                  :y="boxHeight + 10"
                  :x="padding + i * boxSize">
                {{parseInt(bound) | kmb}}
            </text>
        </svg>
    </div>
</template>

<script>
import config from '../../../../config';
import * as scales from 'd3-scale';
export default {
    name: 'map-legend',
    props: ['title', 'scale'],
    computed: {
        boxSize () {
            return (this.width - this.padding * 2) / this.buckets;
        },
        boundaries () {
            let boundaries = [this.scale.min];
            const buckets = this.buckets;
            const inverseScale = scales.scaleLog()
                .domain([this.scale.min, this.scale.max])
                .range([0,1]).invert;
            for (let i = 0; i < buckets; i++) {
                let rightBound = inverseScale((i + 1) / buckets);
                boundaries.push(rightBound);
            }
            return boundaries;
        }
    },
    data () {
        return {
            width: 300,
            padding: 15,
            boxHeight: 15,
            buckets: 8
        }
    }
}
</script>

<style>
.map.legend {
    width: 300px;
    position: absolute;
    bottom: 120px;
    right: 10px;
    background-color: rgba(255,255,255,0.8);
}
.map.legend .title {
    margin: 15px;
}
.map.legend svg {
    height: 45px;
}
.map.legend text {
    font-size: 8px;
    text-anchor: middle;
}
</style>

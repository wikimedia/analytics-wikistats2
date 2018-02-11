<template>
    <div v-if="palette" class = "map legend">
        <h4 class = "title">{{title}}</h4>
        <svg>
            <rect v-for="(color, i) in palette"
                  :style="{
                      fill: color
                  }"
                  :x="padding + i * boxSize"
                  :y="0"
                  :width="boxSize"
                  :height="boxHeight"
            />
            <text v-for="(color, i) in palette"
                  :y="boxHeight + 10"
                  :x="padding + i * boxSize">
                {{parseInt(buckets[i].split('-')[0]) | kmb}}
            </text>
            <text :y="boxHeight + 10"
                  :x="padding + palette.length * boxSize">
                {{parseInt(buckets[palette.length - 1].split('-')[1]) | kmb}}
            </text>
        </svg>
    </div>
</template>

<script type="text/javascript">
    import config from '../../../../config';
    export default {
        name: 'map-legend',
        props: ['title', 'palette', 'min', 'max'],
        computed: {
            boxSize () {
                return (this.width - this.padding * 2) / this.palette.length;
            }
        },
        data () {
            return {
                width: 300,
                padding: 15,
                boxHeight: 15,
                buckets: config.buckets
            }
        },
        methods: {
            getBucketValue (i) {
                const bucketMin = this.min + i * (this.max - this.min) / this.palette.length;
                return this.$options.filters.kmb(bucketMin);
            }
        }
    }
</script>

<style type="text/css">
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

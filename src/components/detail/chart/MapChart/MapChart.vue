<template>
<div class="map container">
    <map-tooltip v-if="currentHover"
        :x="currentHover.x"
        :y="currentHover.y"
        :unit="graphModel.config.value"
        :number="currentHover.number"
        :name="currentHover.name"
    />
    <map-legend
        v-if="data"
        :title="graphModel.config.fullName"
        :palette="palette"
    />
    <svg class="map canvas">
        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <rect x="0" y="0" width="50" height="50"/>
            <path d="M-1,1 l2,-2
                     M0,4 l4,-4
                     M3,5 l2,-2"
                  style="stroke:black; stroke-width:1" />
        </pattern>
        <g class="map group">
        </g>
    </svg>
</div>
</template>

<script>
import _ from 'lodash';
import * as d3 from 'd3-selection';
import * as zoom from 'd3-zoom';
import * as geo from 'd3-geo';
import * as scales from 'd3-scale';
import borders from './world-50m';
import * as topojson from 'topojson-client';
import * as d3_color from 'd3-scale-chromatic';
import isoLookup from './isoLookup'

import MapLegend from './MapLegend';
import MapTooltip from './MapTooltip';
import config from '../../../../config';

export default {
    name: 'map-chart',
    props: ['graphModel', 'data'],
    components: {
        MapLegend,
        MapTooltip
    },
    mounted () {
        this.initMap();
    },
    data () {
        return {
            currentHover: null
        }
    },
    computed: {
        formattedNumber () {
            return this.graphModel.formatNumberForMetric(this.currentHover.number);
        },
        palette () {
            if (!this.data.length) return
            const colorPalette = d3_color[{
                "reading": "schemeGreens",
                "contributing": "schemeBlues",
                "content": "schemeOranges"
            }[this.graphModel.config.area]];
            let max = this.graphModel.getMinMax().max;
            return colorPalette[Math.max(3, config.buckets.indexOf(max) + 1)];
        },
        dataByCountry () {
            return this.data.reduce((p,c) => {
                p[c.country] = c.total.total;
                return p;
            }, {});
        }
    },
    watch: {
        data: {
            handler: function () {
                this.drawChoropleth();
            }
        }
    },
    methods: {
        initMap () {
            let path = geo.geoPath();
            const projection = path.projection(geo.geoMercator());
            let svg = d3.select('.map .canvas');
            let g = svg.select('g');
            let features = g.selectAll('path').data(topojson.feature(borders, borders.objects.countries).features);
            let paths = features.enter().append('path')
                .attr('d', projection)
                .attr('fill', '#fff')
                .attr('class', function (feature) {
                    return 'country ' + feature.id;
                });
            const zoom = getZoomBehavior(paths, path, projection);
            svg.call(zoom);
            zoom.translateTo(svg, 120, -50);
            zoom.scaleTo(svg, 0.8)
            if (this.data.length > 0) {
                this.drawChoropleth();
            }

        },
        drawChoropleth () {
            let self = this;
            let element = this.$el;
            borders.objects.countries.geometries = borders.objects.countries.geometries.map(f => {
                let countryISO = _.findKey(isoLookup, country => country.numericCode === f.id);
                if (!countryISO) return Object.assign(f, {color: "#fff", number: null});
                let countryName = isoLookup[countryISO].en;
                const number = this.dataByCountry[countryISO];
                f.properties = {
                    color: getColor(number, this.palette),
                    number: number,
                    name: countryName
                };
                return f;
            });
            let svg = d3.select(element).select('.map.canvas');
            let g = svg.select('.map.group');
            let features = g.selectAll('path').data(topojson.feature(borders, borders.objects.countries).features);
            features.attr('fill', function (feature) {
                return feature.properties.color;
            }).on('mousemove', function (d) {
                if (d.properties.number) {
                    const diagonalHatch = d3.select('#diagonalHatch')
                    d3.select(diagonalHatch.node().firstChild).style('fill', d.properties.color);
                    d3.select(this).attr('fill', 'url(#diagonalHatch)');
                    self.currentHover = {
                        name: d.properties.name,
                        number: d.properties.number,
                        x: d3.event.layerX,
                        y: d3.event.layerY
                    };
                }
            }).on('mouseout', function (d) {
                d3.select(this).attr('fill', d.properties.color);
                self.currentHover = null;
            });
        }
    }
};

function getColor (number, palette) {
    if (typeof number === 'undefined') { return '#fff'; }
    return palette[config.buckets.indexOf(number)];
}

function darkenColorBy (color, percentageToDarkenBy) {
    return "#" + color.replace('#', '').split("").reduce((p, c, i) => {
        if(i % 2 === 0){
            p.push(c);
        } else {
            p[p.length - 1] += c;
        }
        return p;
    }, []).map(c => {
        let chan = parseInt(parseInt('0x' + c) *
            (1 - percentageToDarkenBy * 0.01)).toString(16);
        (chan.length < 2) && (chan = 0 + chan);
        return chan;
    }).join('');
}

function getZoomBehavior (features, path, projection) {
    const zoomBehavior = zoom.zoom().scaleExtent([0.8, 8]);
    zoomBehavior.on('zoom', function() {
        const scale = d3.event.transform.k
        const x = d3.event.transform.x;
        const y = d3.event.transform.y;
        features.attr('transform','translate(' +
            x +','+ y + ')scale(' + scale + ')');
        features.selectAll('path')
            .attr('d', path.projection(projection));
    });
    return zoomBehavior;
};

</script>

<style type="text/css">

    .map svg {
        width: 100%;
        height: 500px;
        margin-bottom:40px;
    }

    .country {
        stroke: #555;
        stroke-width: 0.5px;
        vector-effect: non-scaling-stroke;
    }
</style>

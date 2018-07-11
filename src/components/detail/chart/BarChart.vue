<template>
<div class="graphContainer">
    <div v-if="hoveredBar" class="bar valuePopup" :style="getPopupPosition(hoveredBar)" :class="popupOrientation(hoveredBar)">
        <b>{{hoveredBar.month | ISOdateUTC(granularityFormat) }}</b>
        <div><b><span :style="{ color: hoveredBar.color }">{{hoveredBar.key}}</span></b>
        <span>{{hoveredBar.value | thousands}}</span></div>
    </div>
    <div class="big bar chart">
        <svg>
            <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="8" patternTransform="rotate(45 0 0)">
                <rect x="0" y="0" width="50" height="50"/>
                <line x1="0" y1="0" x2="0" y2="50" style="stroke:black; stroke-width:3" />
            </pattern>
            <g class="graph">
            </g>
        </svg>
    </div>
</div>
</template>

<script>
import * as d3 from 'd3-selection';
import * as scales from 'd3-scale';
import * as arr from 'd3-array';
import * as axes from 'd3-axis';
import * as format from 'd3-format';
import * as time from 'd3-time';

import utils from '../../../utils';
import _ from 'lodash';

import config from '../../../config';

export default {
    name: 'bar-chart',

    props: ['graphModel', 'data'],

    data () {
        return {
            hoveredBar: null
        };
    },

    computed: {

        granularityFormat () {
            return utils.getDateFormatFromData(this.data);
        },
    },

    mounted () {
        this.drawChart();
    },

    watch: {
        data: function () {
            this.drawChart();
        },
    },

    methods: {

        // PUBLIC: used by parent components
        redraw () {
            this.drawChart();
        },

        drawChart () {
            if (!this.data || !this.data.length) {
                return;
            }

            let unitFilter;
            if (this.graphModel.config.unit === "bytes"){
                unitFilter = this.$options.filters.bytes;
            }
            else {
                unitFilter = this.$options.filters.kmb;
            }

            // We make sure that any selected point in a previous chart is cleared
            this.hoveredBar = null;

            const root = d3.select(this.$el).select('.big'),
                  margin = {top: 6, right: 0, bottom: 20, left: 40},
                  padding = 4;

            const svg = root.select('svg');
            const g = svg.select('.graph')
            // clean up after old chart
            svg.attr('width', 0).attr('height', 0);
            g.selectAll('*').remove();

            const n = root.node();
            const activeDict = this.graphModel.getActiveBreakdownValues();
            let dates = this.data.map((d) => new Date(Date.parse(d.month)));
            const datespan = arr.extent(dates);

            const { min, max } = this.graphModel.getMinMax();

            let height = n.offsetHeight - margin.top - margin.bottom - padding;
            let y = scales.scaleLinear().range([height, 0]);
            y.domain([min, max]);
            const yAxis = axes.axisLeft(y).ticks(7)
                            .tickFormat(unitFilter);
            const yAxisContainer = g.append('g')
                .call(yAxis)
                .style('font-size', '13px')
                .style('font-family', 'Lato, "Open Sans"');
            const yAxisContainerWidth = yAxisContainer.node().getBBox().width;
            g.attr(
                'transform', `translate(${yAxisContainerWidth},${margin.top})`
            );
            let width = this.$el.offsetWidth - 75;
            let xW = scales.scaleBand()
                           .range([0, width])
                           .domain(dates)
                           .paddingOuter(0)
                           .paddingInner(0.1)
                           .align(0);

            svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight);

            let graphElement = g.append('g');

            y.domain([min, max]);
            let self = this;
            graphElement.selectAll('.bar').data(this.data)
                .enter().selectAll('.minibar').data((d) => {
                    const newData = this.graphModel.activeBreakdown.values
                        .filter(b => b.on)
                        .map((b, i) => ({
                            month: d.month,
                            key: b.name,
                            value: d.total[b.key],
                            color: config.getColorForBreakdown(this.graphModel.activeBreakdown, b.key, this.graphModel.config.area),
                            width: xW.bandwidth() / Object.keys(activeDict).length,
                            index: i
                        }));

                    return newData;
                }).enter().append('rect')
                    .attr('x', (d) => {
                        return xW(d.month) + d.index * d.width;
                    })
                    .attr('y', (d) => {
                        if (d.value >= 0) {
                            return y(d.value);
                        } else {
                            return y(0);
                        }
                    })
                    .attr('width', (d) => d.width)
                    .attr('height', (d) => d.value ? Math.abs(y(d.value) - y(0)) : 0)
                    .attr('fill', (d) => d.color)
                    .on('mouseover', function (d) {
                        const diagonalHatch = d3.select('#diagonalHatch')
                        d3.select(diagonalHatch.node().firstChild).style('fill', d.color);
                        d3.select(this).attr('fill', 'url(#diagonalHatch)');
                        self.hoveredBar = d;
                        const containerBB = self.$el.getBoundingClientRect();
                        const barBB = this.getBoundingClientRect();
                        self.hoveredBar.left = barBB.left - containerBB.left + margin.left;
                        self.hoveredBar.top = barBB.top - containerBB.top + barBB.height;
                        self.hoveredBar.right = containerBB.right - barBB.right + margin.left;
                    })
                    .on('mouseout', function (d) {
                        d3.select(this).attr('fill', d.color);
                        d3.event.stopPropagation();
                    });

            if (min < 0) {
                graphElement.append('line')
                    .attr('x1', 0)
                    .attr('x2', width)
                    .attr('y1', y(0))
                    .attr('y2', y(0))
                    .style('stroke', 'black')
                    .style('stroke-width', 0.5);
            }
            const x = scales.scaleTime()
                          .rangeRound([0, width])
                          .domain(datespan);
            const xAxis = axes.axisBottom(x);
            g.append('g').attr('transform', `translate(0,${height})`)
                .call(xAxis)
                .attr('class','x-axis-labels')
                .style('font-size', '13px')
                .style('font-family', 'Lato, "Open Sans"')
                .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");
            svg.attr('width', n.offsetWidth).attr('height', g.node().getBBox().height + margin.top);
            // n.onmouseout = this.onGraphMouseOut.bind(this);

        },
        onGraphMouseOut (e) {
            this.hoveredBar = null;
        },
        popupOrientation (bar) {
            if (bar.left > this.$el.getBoundingClientRect().width/2) {
                return {
                    'left': true
                }
            } else {
                return {
                    'right': true
                }
            }
        },
        getPopupPosition (bar) {
            if (bar.left > this.$el.getBoundingClientRect().width / 2) {
                return {top: (bar.top / 2) + 'px', right: bar.right + 'px'}
            } else {
                return {top: (bar.top / 2) + 'px', left: bar.left + 'px'}
            }
        }
    }
}
</script>

<style>
.fullscreen .big.bar.chart { min-height: 492px; }
.big.bar.chart {
    min-height: 386px;
}
.bar.valuePopup {
    text-align: right;
    position: absolute;
    background-color:rgba(255, 255, 255, 0.7);
    padding: 5px;
    min-width: 20%;
}
.bar.valuePopup:after{
    position: absolute;
    top: 30%;
    content: '';
    width: 0;
    height: 0;
}
.bar.valuePopup.right:after {
    left: -10px;
    border-right: solid 10px rgba(255, 255, 255, 0.7);
    border-bottom: solid 10px transparent;
    border-top: solid 10px transparent;
}
.bar.valuePopup.left:after {
    right: -10px;
    border-left: solid 10px rgba(255, 255, 255, 0.7);
    border-bottom: solid 10px transparent;
    border-top: solid 10px transparent;
}
@media(max-width: 450px) {
    .big.bar.chart {
        min-height: 250px;
    }
}
</style>

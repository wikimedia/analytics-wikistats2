<template>
<div class="graphContainer">
    <div v-if="hoveredPoint" class="valuePopup">
        <p ><b>{{formatDate(hoveredPoint.month)}}</b></p>
        <div v-if="!graphModel.getActiveBreakdown()">
            <p>{{selectedValue}}</p>
        </div>
        <div v-else v-for="b in this.selectedValue">
            <p class="breakdown">
                <b><span v-bind:style="{ color: getColorForBreakdown(b[0])}">{{graphModel.getActiveBreakdown().values.find(v => v.key === b[0]).name + ": "}}</span></b><span>{{b[1]}}</span>
            </p>
        </div>
    </div>
    <div class="big line chart">
        <svg>
            <g class="graph">
            </g>
        </svg>
    </div>
</div>
</template>

<script>
import * as d3 from 'd3-selection'
import * as scales from 'd3-scale'
import * as arr from 'd3-array'
import * as axes from 'd3-axis'
import * as format from 'd3-format'
import * as time from 'd3-time'
import * as shape from 'd3-shape'

import dateformat from 'dateformat';

import _ from 'lodash';

import config from '../../../config'

export default {
    name: 'line-chart',
    props: ['graphModel'],

    mounted () {
        this.drawChart();
    },

    computed: {
        selectedValue () {
            if (!this.graphModel.getActiveBreakdown()) {
                return this.hoveredPoint.total;
            } else {
                let l = [];
                _.forEach(this.hoveredPoint.total, (value, key) => {
                    if(this.graphModel.getActiveBreakdown().values.find(v => v.key === key).on){
                        l.push([key, value]);
                    }
                });
                return _.sortBy(l, (val) => val[1]).reverse();
            }
        },
        rowData () {
            return this.graphModel.getGraphData().map((row) => {
                return {
                    total: row.total,
                    month: new Date(row.month)
                };
            });
        }
    },

    data () {
        return {
            hoveredPoint: null
        };
    },

    watch: {
        graphModel: {
            handler: function () {
                this.drawChart();
            },
            deep: true
        },

        breakdown: function () {
            this.drawChart();
        }
    },

    methods: {

        drawChart () {
            const self = this;

            // We make sure that any selected point in a previous chart is cleared
            this.hoveredPoint = null;

            const root = d3.select(this.$el).select('.big'),
                  margin = {top: 6, right: 0, bottom: 20, left: 40},
                  padding = 4;

            const svg = root.select('svg');
            svg.attr('width', 0).attr('height', 0);
            const g = svg.select('.graph').attr(
                'transform', `translate(${margin.left},${margin.top})`
            );
            g.selectAll('*').remove();
            const rowData = this.rowData;
            let activeBreakdown = self.graphModel.getActiveBreakdown();
            const max = this.getMaxValue(rowData, activeBreakdown);

            const n = root.node();

            // Generate the x and y scales that we'll use to calculate the line
            // and the two axes.

            const width = n.offsetWidth - margin.left - margin.right;
            let x = scales.scaleTime().rangeRound([0, width]);
            const dates = rowData.map((d) => d.month);
            x.domain(arr.extent(dates));

            const height = n.offsetHeight - margin.top - margin.bottom - padding;
            let y = scales.scaleLinear().rangeRound([height, 0]);
            y.domain([0, max]);

            // Resize the parent svg element so that it envelops the whole content

            svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight);

            n.onmousemove = this.onGraphMouseMove;
            n.onmouseout = this.onGraphMouseOut.bind(this);


            const line = shape.line()
                .x((d) => x(d.month))
                .y((d) => y(d.total));

            let breakdownData = [rowData];
            let bColor = this.graphModel.getDarkColor();

            /*
            Data is flattened if we have breakdowns, so that more than one line is generated:

            {                                   [
                month: '2017-06-06',                {
                total: {                                month: '2017-06-06',
                    mobile: x,          ===>            key: 'mobile',
                    desktop: y                          value: y
                }                                   },
            }                                       {
                                                        month: '2017-06-06',
                                                        key: 'desktop',
                                                        value: x
                                                    }
                                                ]
            */

            if (activeBreakdown) {
                breakdownData = Object.keys(rowData[0].total).filter(key => {
                    return activeBreakdown.values.find(value => value.key === key).on;
                }).map((breakdownName) => {
                    return rowData.map((row) => {
                        return {
                            month: row.month,
                            total: row.total[breakdownName],
                            key: breakdownName
                        };
                    });
                })
            }
            breakdownData.forEach(breakdown => {

                // We need to find each breakdown's corresponding colour from the config

                if (activeBreakdown) {
                    bColor = config.colors[self.graphModel.getArea()][[config.stableColorIndexes[breakdown[0].key]]];
                }
                g.append('path').datum(breakdown)
                    .attr('d', line)
                    .style('stroke', '#000')
                    .style('stroke-width', '3px')
                    .style('fill', 'none');
                g.append('path').datum(breakdown)
                    .attr('d', line)
                    .attr('class', 'statLine breakdownLine')
                    .style('stroke', bColor)
                    .style('stroke-width', '2px')
                    .style('fill', 'none');
            });
            this.addHoverGuide(g, rowData, x, y);
            this.addAxes(x, y, g);

            // Final resizing to include the axes

            svg.attr('width', n.offsetWidth + padding).attr('height', n.offsetHeight);
        },

        formatDate(date) {
            return dateformat(date, "yyyy-mm-dd");
        },

        addAxes (x, y, g) {
            const height = y.range()[0];
            const xAxis = axes.axisBottom(x),
                  yAxis = axes.axisLeft(y).ticks(7)
                            .tickFormat(format.format('.2s'));
            g.append('g')
                .call(yAxis)
                .attr('class', 'yAxis')
                .style('font-size', '13px')
                .style('font-family', 'Lato, "Open Sans"');
            g.append('g').attr('transform', `translate(0,${height})`)
                .call(xAxis)
                .style('font-size', '13px')
                .style('font-family', 'Lato, "Open Sans"')
                .selectAll("text")
                    .style("text-anchor", "end")
                    .attr('class', 'xAxisLabel')
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");
        },

        getColorForBreakdown (key) {
            return config.colors[this.graphModel.getArea()][config.stableColorIndexes[key]];
        },


        onGraphMouseMove (e) {
            const newPos = e.layerX - d3.select('.yAxis').node().getBBox().width;
            d3.select('line')
                .style('display', 'unset');
            d3.select('line')
                .attr('x1', newPos)
                .attr('x2', newPos);
        },

        onGraphMouseOut (e) {
            $('.guide').fadeOut(100);
            this.hoveredPoint = null;
        },

        getMaxValue (rowData, activeBreakdown) {
            if (activeBreakdown) {
                return _.max(rowData.map((r) => {
                    return _.max(_.map(r.total, (breakdownValue, key) => {
                        return activeBreakdown.values
                                    .find(v => v.key === key).on? breakdownValue: 0;
                    }));
                }));
            } else {
                return _.max(rowData.map((d) => d.total));
            }
        },

        // The hover guide is a UI element that shows the value of each point in the
        // line when hovering. It adds a vertical line for better feedback.
        addHoverGuide (g, rowData, x, y) {
            let self = this;
            const width = x.range()[1];
            const height = y.range()[0];
            this.addGuideLine(g, height);
            let hoverGs = g.selectAll('.pointCircle')
                .data(rowData)
                .enter().append('g').attr('class', 'pointCircle');
            const invisibleBarWidth = (width / rowData.length) + 4;

            // We need some invisible rectangles to detect hover on each segment
            // of the line.

            hoverGs.append('rect')
                .attr('class', 'hover')
                .attr('x', d => x(d.month) - invisibleBarWidth / 2)
                .attr('y', 0)
                .attr('height', height)
                .attr('width', invisibleBarWidth)
                .on('mouseover', function (d) {
                    $(this).siblings().show();
                    self.hoveredPoint = d;
                })
                .on('mouseout', function () {
                    $(this).siblings().hide();
                    d3.event.stopPropagation();
                });

            // For better clarity on which point is being selected, we add circles that
            // indicate the exact one.
            hoverGs.each(function (d) {
                let sel = d3.select(this);
                const activeBreakdown = self.graphModel.getActiveBreakdown();
                if (activeBreakdown) {
                    _.forEach(d.total, (value, key) => {
                        if (activeBreakdown.values.find(v => v.key === key).on) {
                            sel.append('circle')
                                .attr('cx', d => x(d.month))
                                .attr('cy', d => y(value))
                                .attr('r', 5)
                                .style('display', 'none');
                        }
                    });
                } else {
                    sel.append('circle')
                    .attr('cx', d => x(d.month))
                    .attr('cy', d => y(d.total))
                    .attr('r', 5)
                    .style('display', 'none');
                }
            });
        },

        addGuideLine (g, height) {
            g.append('line')
                .attr('class', 'guide')
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', height)
                .attr('y2', 0)
                .style('stroke', 'gray')
                .style('stroke-width', 1);
        }
    }
}
</script>

<style>
.big.line.chart {
    min-height: 386px;
    min-width: 700px;
}
.fullscreen .big.line.chart { min-height: 492px; }
.pointCircle {
    stroke-width: 1px;
    fill-opacity: 0;
    stroke: black;
}
.pointCircle rect {
    stroke-width: 0;
    fill-opacity: 0;
}

.valuePopup {
    text-align: right;
    position: absolute;
    background-color:rgba(255, 255, 255, 0.7);
    padding: 5px;
    top: 50px;
    right: 10px;
    min-width: 20%;
}

.breakdown {
    white-space: nowrap;
}
</style>

<template>
<div class="graphContainer">
    <div v-if="hoveredPoint" class="line valuePopup"  :style="{ top: hoveredPointTop - 65 + 'px', left: hoveredPointLeft - 80 + 'px', border: 'solid 1px ' + hoveredPointColor,
                  borderBottom: 'solid 3px ' + hoveredPointColor }">
        <b>{{hoveredPoint.month | ISOdateUTC(granularityFormat) }}</b>
        <div v-for="b in this.selectedValue" class="breakdown">
            <b><span :style="{ color: b.color }">{{b.name | capitalize}}</span></b>
            <span>{{b.value | thousands}}</span>
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
import * as time from 'd3-time'
import * as shape from 'd3-shape'
import {
    annotationCustomType, annotationCalloutCircle, annotation,
} from 'd3-svg-annotation'

import { groupIfOverlapping } from '../../../models/Annotations';
import utils from '../../../utils';
import _ from 'lodash';

import config from '../../../config'

export default {
    name: 'line-chart',
    props: ['graphModel'],

    data () {
        return {
            // This is dirty, but vue won't update the component according to hoveredPoint's properties
            hoveredPoint: null,
            hoveredPointTop: null,
            hoveredPointLeft: null,
            hoveredPointColor: null,
            hoveredPointColor: null,
            margin: {top: 6, right: 0, bottom: 20, left: 40},
            x: null,
            y: null,
        };
    },

    computed: {
        selectedValue () {
            let l = [];
            const activeDict = this.graphModel.getActiveBreakdownValues();

            _.forEach(this.hoveredPoint.total, (value, key) => {
                if(key in activeDict){
                    l.push({
                        key, value,
                        color: this.getColorForBreakdown(key),
                        name: key,
                    });
                }
            });
            return _.sortBy(l, d => d.value).reverse();
        },

        granularityFormat () {
            return utils.getDateFormatFromData(this.graphModel.graphData);
        },
    },

    mounted () {
        this.drawChart();
    },

    watch: {
        'graphModel.graphData' () {
            this.drawChart();
        },
    },

    methods: {

        transformAndAddAnnotations (annotations) {

            const horizontal = this.x.range()[1],
                  vertical = this.y.range()[0],
                  diameter = 28;

            const preparedAnnotations = groupIfOverlapping(
                annotations.map(m => {
                    const px = this.x(m.date),
                          py = this.y(m.value),
                          tooRight = px > horizontal - 120,
                          tooLow = py > vertical - 100;

                    return {
                        subject: {
                            radius: diameter / 2,
                            radiusPadding: 2,
                        },
                        color: '#4488aa',
                        dx: tooRight ? -20 : 20,
                        dy: tooLow ? -50 : 50,
                        x: px,
                        y: py,
                        breakdownValue: m.breakdownValue,
                        note: {
                            bgPadding: 10,
                            label: m.label,
                            title: m.title,
                        },
                    };
                }),
                28,
            );

            this.addAnnotations(
                this.getRoot().select('svg').select('.graph'),
                preparedAnnotations,
            );
        },

        // PUBLIC: used by parent components
        redraw () {
            this.drawChart();
        },

        getRoot () {
            return d3.select(this.$el).select('.big');
        },

        drawChart () {
            if (!this.graphModel.graphData.length) {
                return;
            }

            // We make sure that any selected point in a previous chart is cleared
            this.hoveredPoint = null;

            const root = this.getRoot(),
                  padding = 4;

            const svg = root.select('svg');
            const g = svg.select('.graph');
            // clean up after old chart
            svg.attr('width', 0).attr('height', 0);
            g.selectAll('*').remove();

            const activeBreakdown = this.graphModel.activeBreakdown;
            const { min, max } = this.graphModel.getMinMax();

            const n = root.node();

            // Generate the x and y scales that we'll use to calculate the line
            // and the two axes.
            const width = n.offsetWidth - this.margin.left - this.margin.right - padding*2;
            const x = scales.scaleTime().rangeRound([0, width]);
            const dates = this.graphModel.graphData.map((d) => d.month);
            x.domain(arr.extent(dates));

            const height = n.offsetHeight - this.margin.top - this.margin.bottom - padding;
            const y = scales.scaleLinear().rangeRound([height, 0]);
            y.domain([min, max]);

            // Resize the parent svg element so that it envelops the whole content

            svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight);

            n.onmousemove = this.onGraphMouseMove;
            n.onmouseout = this.onGraphMouseOut;


            const line = shape.line()
                .x((d) => x(d.month))
                .y((d) => y(d.total));

            const activeDict = this.graphModel.getActiveBreakdownValues();
            let bColor = this.graphModel.darkColor;

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
            Object.keys(
                _.reduce(this.graphModel.graphData, (acc, elem) => {
                    return Object.assign(acc, elem.total);
                }, {}))
                .filter(key => key in activeDict)
                .map((breakdownName) => {
                    return this.graphModel.graphData.map((row) => {
                        return {
                            month: row.month,
                            total: row.total[breakdownName],
                            key: breakdownName
                        };
                    }).filter(elem => typeof elem.total === 'number');
                })
                .forEach(breakdown => {
                    // We need to find each breakdown's corresponding colour from the config
                    bColor = config.getColorForBreakdown(activeBreakdown, breakdown[0].key, this.graphModel.config.area);
                    g.append('path').datum(breakdown)
                        .attr('d', line)
                        .attr('class', 'statLine breakdownLine')
                        .style('stroke', bColor)
                        .style('stroke-width', '3px')
                        .style('fill', 'none');
                });

            this.addHoverGuide(g, this.graphModel.graphData, x, y);
            this.addAxes(x, y, g);

            // Final resizing to include the axes
            svg.attr('width', n.offsetWidth + padding).attr('height', g.node().getBBox().height + this.margin.top);

            // we need the scales to help add things like annotations later
            this.x = x;
            this.y = y;

            if (this.graphModel.hasTruncatedValues) {
                const truncatedBoundingBox = {
                    x: 1,
                    y: y(1000),
                    width: width,
                    height: height - y(1000)
                }
                this.addTruncatedShield(truncatedBoundingBox, g);
            }

            this.graphModel.afterAnnotations(this.transformAndAddAnnotations);
        },

        addAxes (x, y, g) {

            let unitFilter;
            if (this.graphModel.config.unit == 'bytes'){
                unitFilter = this.$options.filters.bytes;
            }
            else {
                unitFilter = this.$options.filters.kmb;
            }

            const height = y.range()[0];
            const xAxis = axes.axisBottom(x),
                  yAxis = axes.axisLeft(y).ticks(7)
                            .tickFormat(unitFilter);
            const yContainer = g.append('g')
                .call(yAxis)
                .attr('class', 'yAxis')
                .style('font-size', '13px')
                .style('font-family', 'Lato, "Open Sans"');
            g.append('g').attr('transform', `translate(0,${height})`)
                .call(xAxis)
                .style('font-size', '13px')
                .style('font-family', 'Lato, "Open Sans"')
                .selectAll('text')
                    .style('text-anchor', 'end')
                    .attr('class', 'xAxisLabel')
                    .attr('dx', '-.8em')
                    .attr('dy', '.15em')
                    .attr('transform', 'rotate(-45)');
            g.attr(
                'transform', `translate(${yContainer.node().getBBox().width},${this.margin.top})`
            );
        },
        addTruncatedShield (boundingBox, g) {
            g.append('rect')
                .attr('x', 1)
                .attr('y', boundingBox.y)
                .attr('width', boundingBox.width)
                .attr('height', boundingBox.height)
                .attr('fill', 'white')

            g.append('line')
                .attr('x1', 1)
                .attr('y1', boundingBox.y)
                .attr('x2', boundingBox.width)
                .attr('y2', boundingBox.y)
                .attr('style', 'stroke:#990000; stroke-width:2')
                .attr('stroke-dasharray', '2')

            g.append('text')
                .attr('width', boundingBox.width)
                .attr('height', boundingBox.height)
                .attr('x', 10)
                .attr('y', boundingBox.y + 20)
                .attr('style', 'stroke:#990000; stroke-width: 0.5; font-size: 12px')
                .text('Values under 1000 are not reported to preserve accuracy')
        },

        getColorForBreakdown (key) {
            return config.getColorForBreakdown(this.graphModel.activeBreakdown, key, this.graphModel.config.area);
        },


        onGraphMouseMove (e) {
            const leftDistFromContainer = e.pageX - this.$el.getBoundingClientRect().left
            const newPos = leftDistFromContainer - d3.select('.yAxis').node().getBBox().width;
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

        // The hover guide is a UI element that shows the value of each point in the
        // line when hovering. It adds a vertical line for better feedback.
        addHoverGuide (g, rowData, x, y) {
            const self = this;

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
                .on('mousemove', function (d) {
                    $(this).siblings().show();
                    self.hoveredPoint = d;
                    const containerBB = self.$el.getBoundingClientRect();
                    const graphPanelBB = self.$parent.$el.getBoundingClientRect();
                    const pointBB = this.getBoundingClientRect();
                    const containerHeight = containerBB.height;
                    if (d3.event.layerY > containerHeight / 2) {
                        self.hoveredPointTop = containerHeight / 4;
                    } else {
                        self.hoveredPointTop = 3 * (containerHeight / 4);
                    }
                    self.hoveredPointLeft = pointBB.left - graphPanelBB.left + invisibleBarWidth / 2;
                    self.hoveredPointRight = containerBB.right - pointBB.right + self.margin.left;
                })
                .on('mouseout', function () {
                    $(this).siblings().hide();
                    d3.event.stopPropagation();
                });

            // For better clarity on which point is being selected, we add circles that
            // indicate the exact one.
            const activeDict = this.graphModel.getActiveBreakdownValues();
            hoverGs.each(function (d) {
                let sel = d3.select(this);
                const activeBreakdown = self.graphModel.activeBreakdown;
                _.forEach(d.total, (value, key) => {
                    if (key in activeDict) {
                        sel.append('circle')
                            .attr('cx', d => x(d.month))
                            .attr('cy', d => y(value))
                            .attr('r', 5)
                            .style('display', 'none');
                    }
                });
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
        },

        addAnnotations (g, annotations) {
            const customCircle = annotationCustomType(annotationCalloutCircle, {
                className: 'customCalloutCircle',
                connector: {
                    end: 'arrow',
                    type: 'line',
                },
                note: {
                    align: 'dynamic',
                    lineType: 'horizontal',
                },
            });

            const makeAnnotations = annotation()
                .editMode(false)
                .type(customCircle)
                .annotations(annotations);

            g.append('g')
                .attr('class', 'annotation-group')
                .call(makeAnnotations)
                .on('mouseover', this.onGraphMouseOut);
        },
    }
}
</script>

<style>
.big.line.chart {
    min-height: 386px;
}
.pointCircle {
    stroke-width: 1px;
    fill-opacity: 0;
    stroke: black;
}
.pointCircle rect {
    stroke-width: 0;
    fill-opacity: 0;
}

.line.valuePopup {
    text-align: right;
    position: absolute;
    background-color:rgba(255, 255, 255, 1);
    padding: 5px;
    top: 50px;
    left: 40%;
    min-width: 20%;
    border: solid lightgray 1px;
    padding: 12px;
    box-shadow: 2px 2px 5px lightgray;
}

.breakdown {
    white-space: nowrap;
}
@media(max-width: 450px) {
    .big.line.chart {
        min-height: 250px;
        width: calc(100vw - 2em);
    }
}
</style>

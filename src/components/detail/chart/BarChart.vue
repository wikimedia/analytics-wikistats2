<template>
<div class="graphContainer">
    <div v-if="hoveredBar" class="bar valuePopup" :style="getPopupStyle(hoveredBar)">
        <b>{{dateFormat(hoveredBar.month) }}</b>
        <div><b><span :style="{ color: hoveredBar.color }">{{$t(geti8nBreakdownKey (hoveredBar.breakdownKey)) | capitalize}}</span></b>
        <span>{{hoveredBar.value | thousands}}</span></div>
        <div class="tooltipArrow"><div class="tooltipAfter" :style="getPopupArrowStyle(hoveredBar)"></div></div>
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
import { mapState } from 'vuex';
import * as d3 from 'd3-selection';
import * as scales from 'd3-scale';
import * as arr from 'd3-array';
import * as axes from 'd3-axis';
import * as format from 'd3-format';
import * as time from 'd3-time';
import {
    annotationCustomType, annotationCalloutCircle, annotation,
} from 'd3-svg-annotation';

import TimeRange from 'Src/models/TimeRange';
import { groupIfOverlapping } from 'Src/models/Annotations';
import utils from 'Src/utils';
import _ from 'lodash';
import numeral from 'numeral';

import config from 'Src/config';

export default {
    name: 'bar-chart',
    props: ['graphModel'],

    data () {
        return {
            hoveredBar: null,
            x: null,
            y: null,
        };
    },

    computed: Object.assign(
        mapState('detail', [
            'fullscreen',
        ]), {

            granularityFormat () {
                return utils.getDateFormatFromData(this.graphModel.graphData);
            }
        }
    ),

    mounted () {
        this.drawChart();
    },

    watch: {
        'graphModel.graphData' () {
            this.drawChart();
        },

        fullscreen () {
            this.drawChart();
        },
    },

    methods: {
        dateFormat (date) {
            return TimeRange.dateFormatForGranularity(date, this.graphModel.granularity);
        },
        geti8nBreakdownKey (key) {
            if (key === 'total') return 'general-total';
            return `metrics-${this.graphModel.metricId}-breakdowns-${this.graphModel.activeBreakdown.breakdownName}-values-${key}-name`;
        },

        transformAndAddAnnotations (annotations) {

            const horizontal = this.x.range()[1],
                  vertical = this.y.range()[0],
                  activeKeys = this.graphModel.activeBreakdown.values.filter(bv => bv.on).map(bv => bv.key),
                  barWidth = this.x.bandwidth() / activeKeys.length,
                  diameter = 28;

            const preparedAnnotations =  groupIfOverlapping(
                annotations.map(m => {
                    const px = this.x(m.date) + (barWidth * (activeKeys.indexOf(m.breakdownValue) + 0.5)),
                          py = this.y(m.value) || vertical,
                          tooRight = px > horizontal - 120,
                          tooLow = py > vertical - 100;

                    return {
                        subject: {
                            radius: diameter / 2,
                            radiusPadding: 2,
                        },
                        color: '#225588',
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
                this.x,
                this.y,
            );
        },

        getRoot () {
            return d3.select(this.$el).select('.big');
        },

        drawChart () {
            if (!this.graphModel.graphData || !this.graphModel.graphData.length) {
                return;
            }
            let unitFilter;
            if (this.graphModel.config.unit == 'bytes'){
                unitFilter = n => numeral(n).format('0.[0]B').toUpperCase();
            }
            else {
                unitFilter = n => numeral(n).format('0.[0]a').toUpperCase();
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
            let dates = this.graphModel.graphData.map((d) => d.month);
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
            let width = this.$el.offsetWidth - margin.left;
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
            graphElement.selectAll('.bar').data(this.graphModel.graphData)
                .enter().selectAll('.minibar').data((d) => {
                    return this.graphModel.activeBreakdown.values
                        .filter(b => b.on)
                        .map((b, i) => ({
                            month: d.month,
                            key: b.name,
                            breakdownKey: b.key,
                            value: d.total[b.key],
                            color: config.getColorForBreakdown(this.graphModel.activeBreakdown, b.key, this.graphModel.config.area),
                            width: xW.bandwidth() / Object.keys(activeDict).length,
                            index: i
                        }));
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
                        const graphPanelBB = self.$parent.$el.getBoundingClientRect();
                        const barBB = this.getBoundingClientRect();
                        self.hoveredBar.left = barBB.left - graphPanelBB.left + self.hoveredBar.width/2;
                        self.hoveredBar.top = barBB.top - containerBB.top;
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
                .selectAll('text')
                    .style('text-anchor', 'end')
                    .attr('dx', '-.8em')
                    .attr('dy', '.15em')
                    .attr('transform', 'rotate(-45)');
            svg.attr('width', n.offsetWidth).attr('height', g.node().getBBox().height + margin.top);

            n.onmouseout = this.onGraphMouseOut.bind(this);

            // we need the scales to help add things like annotations later
            this.x = xW;
            this.y = y;

            if (this.graphModel.hasTruncatedValues()) {
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
        onGraphMouseOut (e) {
            this.hoveredBar = null;
        },
        getPopupStyle (bar) {
          // 80 is half of valuePopup width
          return { top: bar.top - 65 + 'px', left: bar.left - 80 + 'px', border: 'solid 1px ' + bar.color,
                  borderBottom: 'solid 3px ' + bar.color }
        },
        getPopupArrowStyle (bar) {
          return { borderBottom: 'solid 3px ' + bar.color, borderRight: 'solid 3px ' + bar.color }
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
                .call(makeAnnotations);
        },
    }
}
</script>

<style>
.fullscreen .big.bar.chart { min-height: 492px; }
.big.bar.chart {
    min-height: 386px;
}
.bar.valuePopup {
    display: flex;
    justify-content:center;
    align-content:center;
    flex-direction:column;
    text-align: center;
    color: #2C2C2C;
    position: absolute;
    background-color: white;
    border-radius: 4px;
    padding: 5px;
    width: 160px;
    height: 75px;
    box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.4);
}
.bar.valuePopup:after {
    content: '';
    position: absolute;
    top: 100%;
    width: 0;
    height: 0;
}
.tooltipArrow {
    width: 50px;
    height: 25px;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    overflow: hidden;
}
.tooltipArrow > .tooltipAfter {
    content: "";
    position: absolute;
    width: 23px;
    height: 23px;
    top: 0;
    left: 50%;
    background-color: white;
    transform: translateX(-50%) translateY(-50%) rotate(45deg);
}

@media(max-width: 450px) {
    .big.bar.chart {
        min-height: 250px;
    }
}
</style>

<template>
<div class="big bar chart">
</div>
</template>

<script>
import * as d3 from 'd3-selection';
import * as scales from 'd3-scale';
import * as arr from 'd3-array';
import * as axes from 'd3-axis';
import * as format from 'd3-format';
import * as time from 'd3-time';
import _ from 'lodash';

import config from '../../../config';
import utils from '../../../utils';

export default {
    name: 'bar-chart',
    props: ['graphModel', 'data'],

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

            const root = d3.select(this.$el),
                  margin = {top: 6, right: 0, bottom: 20, left: 40},
                  padding = 4;

            // clean out any previous chart
            root.selectAll('*').remove();

            const svg = root.append('svg'),
                  g = svg.append('g').attr(
                    'transform', `translate(${margin.left + padding},${margin.top})`
                  );

            const n = root.node();
            const activeDict = this.graphModel.getActiveBreakdownValues();
            let dates = this.data.map((d) => new Date(Date.parse(d.month)));
            const datespan = arr.extent(dates);

            const { min, max } = this.graphModel.getMinMax();

            let height = n.offsetHeight - margin.top - margin.bottom - padding;
            let y = scales.scaleLinear().range([height, 0]);
            y.domain([min, max]);
            const yAxis = axes.axisLeft(y).ticks(7)
                            .tickFormat(this.graphModel.formatNumberForMetric.bind(this.graphModel));
            const yAxisContainer = g.append('g')
                .call(yAxis)
                .style('font-size', '13px')
                .style('font-family', 'Lato, "Open Sans"');
            const yAxisContainerWidth = yAxisContainer.node().getBBox().width;

            let width = n.offsetWidth - margin.left - margin.right - yAxisContainerWidth;
            let xW = scales.scaleBand()
                           .range([0, width])
                           .domain(dates)
                           .paddingOuter(0)
                           .paddingInner(0.1)
                           .align(0);

            svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight);

            let graphElement = g.append('g');

            y.domain([min, max]);
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
                    .attr('height', (d) => Math.abs(y(d.value) - y(0)))
                    .attr('fill', (d) => d.color);

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
                          .rangeRound([0, graphElement.node().getBBox().width])
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

        },
    }
}
</script>

<style>
.big.bar.chart { min-height: 386px; min-width: 700px; }
.fullscreen .big.bar.chart { min-height: 492px; }
</style>

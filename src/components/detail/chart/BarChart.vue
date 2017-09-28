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

export default {
    name: 'bar-chart',
    props: ['breakdown', 'graphModel'],

    mounted () {
        this.drawChart();
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

            const detail = this.graphModel && this.graphModel.getGraphData();
            if (!detail) return;

            const root = d3.select(this.$el),
                  margin = {top: 6, right: 0, bottom: 20, left: 40},
                  padding = 4;

            // clean out any previous chart
            root.selectAll('*').remove();

            const svg = root.append('svg'),
                  g = svg.append('g').attr(
                    'transform', `translate(${margin.left + padding},${margin.top})`
                  );

            function resize () {
                const n = root.node();
                let dates = detail.map((d) => new Date(Date.parse(d.month)));
                const datespan = arr.extent(dates);
                const max = _.max(detail.map((r) => {
                    if (typeof detail[0].total !=  'number') {
                        return _.max(_.map(r.total, (breakdownValue, key) => {
                            return self.graphModel.getActiveBreakdown()
                                    .values.find(v => v.key === key).on? breakdownValue: 0;
                        }));
                    } else {
                        return r.total;
                    }
                }));
                let height = n.offsetHeight - margin.top - margin.bottom - padding;
                let y = scales.scaleLinear().range([height, 0]);
                y.domain([0, max]);
                const yAxis = axes.axisLeft(y).ticks(7)
                                .tickFormat(format.format('.2s'));
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

                const every = detail.length < 10? 1: 5;
                const period = (dates[1] - dates[0]) < 172800000 ? 'timeDay': 'timeMonth';
                let graphElement = g.append('g');

                if (typeof detail[0].total !=  'number') {
                    y.domain([0, max]);
                    graphElement.selectAll('.bar').data(detail)
                        .enter().selectAll('.minibar').data(function (d) {
                            // this should be passed in
                            const breakdown = self.graphModel.getActiveBreakdown();
                            const breakdowns = breakdown.values.filter((x) => x.on);
                            const newData = breakdowns.map((b, i) => ({
                                month: d.month,
                                key: b.name,
                                value: d.total[b.key],
                                color: config.colors[self.graphModel.getArea()][[config.stableColorIndexes[b.key]]],
                                width: xW.bandwidth() / breakdowns.length,
                                index: i
                            }));

                            return newData;
                        }).enter().append('rect')
                            .attr('x', (d) => {
                                return xW(new Date(Date.parse(d.month))) + d.index * d.width;
                            })
                            .attr('y', (d) => y(d.value))
                            .attr('width', (d) => d.width)
                            .attr('height', (d) => height - y(d.value))
                            .attr('fill', (d) => d.color);

                } else {
                    graphElement.selectAll('.bar').data(detail)
                        .enter().append('rect')
                            .attr('x', (d) => xW(new Date(Date.parse(d.month))))
                            .attr('y', (d) => y(d.total))
                            .attr('width', xW.bandwidth())
                            .attr('height', (d) => height - y(d.total))
                            .attr('fill', (d) => self.graphModel.getDarkColor());
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
            }
            resize();
            // TODO: get this to resize cleanly d3.select(window).on('resize', resize)
        },
    }
}
</script>

<style>
.big.bar.chart { min-height: 386px; min-width: 700px; }
.fullscreen .big.bar.chart { min-height: 492px; }
</style>

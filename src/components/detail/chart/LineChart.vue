<template>
<div class="big line chart">
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

import _ from 'lodash';

import config from '../../../config'

export default {
    name: 'line-chart',
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

            const root = d3.select(this.$el),
                  margin = {top: 6, right: 0, bottom: 20, left: 40},
                  padding = 4;

            // clean out any previous chart
            root.selectAll('*').remove();

            const svg = root.append('svg'),
                  g = svg.append('g').attr(
                    'transform', `translate(${margin.left},${margin.top})`
                  );
            const rowData = this.graphModel.getGraphData().map((row) => {
                const splitDate = row.month.split('-');
                return {
                    total: row.total,
                    month: new Date(splitDate[0], splitDate[1], splitDate[2])
                };
            });

            function resize () {
                const n = root.node(),
                      width = n.offsetWidth - margin.left - margin.right,
                      height = n.offsetHeight - margin.top - margin.bottom - padding,
                      x = scales.scaleTime().rangeRound([0, width]),
                      y = scales.scaleLinear().rangeRound([height, 0]),
                      dates = rowData.map((d) => d.month);

                x.domain(arr.extent(dates));
                y.domain([0, arr.max(rowData.map((d) => d.total))]);

                svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight);
                g.attr('width', width).attr('height', height);

                const line = shape.line()
                    .x((d) => x(d.month))
                    .y((d) => y(d.total))
                    .curve(shape.curveBundle.beta(0.5));
                if (self.breakdown) {
                    const max = _.max(rowData.map((r) => {
                        return _.max(_.map(r.total, (breakdownValue, key) => {
                            return self.graphModel.getActiveBreakdown()
                                    .values.find(v => v.key === key).on? breakdownValue: 0;
                        }));
                    }));
                    y.domain([0, max]);
                    Object.keys(rowData[0].total).filter(key => {
                        return self.breakdown.values.find(value => value.key === key).on;
                    }).map((breakdownName) => {
                        return rowData.map((row) => {
                            return {
                                month: row.month,
                                total: row.total[breakdownName],
                                key: breakdownName
                            };
                        });
                    }).forEach(breakdown => {
                        const bColor = config.colors[self.graphModel.getArea()][[config.stableColorIndexes[breakdown[0].key]]];
                        g.append('path').datum(breakdown)
                            .attr('d', line)
                            .attr('class', 'breakdownLine')
                            .style('stroke', bColor)
                            .style('stroke-width', '2px')
                            .style('fill', 'none');
                    });
                } else {
                    g.append('path').datum(rowData)
                        .attr('d', line)
                        .attr('class', 'statLine')
                        .style('stroke', self.graphModel.getDarkColor())
                        .style('stroke-width', '2px')
                        .style('fill', 'none');
                }

                const xAxis = axes.axisBottom(x).ticks(time.timeMonth.every(3)),
                      yAxis = axes.axisLeft(y).ticks(7)
                                .tickFormat(format.format('0.00s'));

                g.append('g')
                    .call(yAxis)
                    .style('font-size', '13px')
                    .style('font-family', 'Lato, "Open Sans"');
                g.append('g').attr('transform', `translate(0,${height})`)
                    .call(xAxis)
                    .style('font-size', '13px')
                    .style('font-family', 'Lato, "Open Sans"');
            }
            resize();
            // TODO: get this to resize cleanly d3.select(window).on('resize', resize)
        },
    }
}
</script>

<style>
.big.line.chart { min-height: 386px; min-width: 700px; }
.fullscreen .big.line.chart { min-height: 492px; }
</style>

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

import config from '../../../apis/Configuration'

export default {
    name: 'line-chart',
    props: ['metricData', 'breakdown'],

    mounted () {
        this.drawChart()
    },

    watch: {
        metricData: {
            handler: function () {
                this.drawChart()
            },
            deep: true
        },

        breakdown: function () {
            this.drawChart()
        }
    },

    methods: {

        drawChart () {
            const self = this

            const root = d3.select(this.$el),
                  margin = {top: 6, right: 0, bottom: 20, left: 40},
                  padding = 4

            // clean out any previous chart
            root.selectAll('*').remove()

            const svg = root.append('svg'),
                  g = svg.append('g').attr(
                    'transform', `translate(${margin.left},${margin.top})`
                  )

            const data = self.metricData.detail ?
                self.metricData : { detail: [] }

            function resize () {
                const n = root.node(),
                      width = n.offsetWidth - margin.left - margin.right,
                      height = n.offsetHeight - margin.top - margin.bottom - padding,
                      x = scales.scaleTime().rangeRound([0, width]),
                      y = scales.scaleLinear().rangeRound([height, 0]),
                      dates = data.detail.map((d) => d.day)

                x.domain(arr.extent(dates))
                y.domain([0, arr.max(data.detail.map((d) => d.metric))])

                svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight)
                g.attr('width', width).attr('height', height)

                const line = shape.line()
                    .x((d) => x(d.day))
                    .y((d) => y(d.metric))
                    .curve(shape.curveBundle.beta(0.5))

                if (self.breakdown) {
                    alert('breakdown not implemented yet for line charts')
                } else {
                    g.append('path').datum(data.detail)
                        .attr('d', line)
                        .style('stroke', self.metricData.darkColor)
                        .style('stroke-width', '2px')
                        .style('fill', 'none')
                }

                const xAxis = axes.axisBottom(x).ticks(time.timeMonth.every(3)),
                      yAxis = axes.axisLeft(y).ticks(7)
                                .tickFormat(format.format('0.00s'))

                g.append('g')
                    .call(yAxis)
                    .style('font-size', '13px')
                    .style('font-family', 'Lato, "Open Sans"')
                g.append('g').attr('transform', `translate(0,${height})`)
                    .call(xAxis)
                    .style('font-size', '13px')
                    .style('font-family', 'Lato, "Open Sans"')
            }
            resize()
            // TODO: get this to resize cleanly d3.select(window).on('resize', resize)
        },
    }
}
</script>

<style>
.big.line.chart { min-height: 386px; min-width: 700px; }
.fullscreen .big.line.chart { min-height: 492px; }
</style>

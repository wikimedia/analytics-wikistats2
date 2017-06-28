<template>
<div>
    <div class="ui medium statistic">
        <div class="label">{{data.fullName}}</div>
        <div class="value">{{data.lastMonthValue | kmb}}</div>
    </div>
    <div>
        <span class="subdued">{{data.lastMonth}}</span>

        <span class="change label">
            <arrow-icon :value="data.changeMoM"/>
            {{data.changeMoM}} % month over month
        </span>
    </div>
    <div class="line-chart">
    </div>
    <div class="ui horizontal small statistic">
        <div class="value">
            {{data.lastYearValue | kmb}}
        </div>
        <div class="change label">
            <arrow-icon :value="data.changeYoY"/>
            {{data.changeYoY}} % year over year
        </div>
    </div>
    <div class="year total subdued">
        Year Total ({{data.lastYear}})
    </div>
</div>
</template>

<script>
import ArrowIcon from '../ArrowIcon'
import * as d3 from 'd3-selection'
import * as scales from 'd3-scale'
import * as arr from 'd3-array'
import * as shape from 'd3-shape'

export default {
    name: 'metric-line-widget',
    props: ['data'],

    components: {
        ArrowIcon,
    },

    mounted () {
        this.drawChart()
    },

    methods: {

        drawChart () {
            const self = this

            const root = d3.select(this.$el).select('.line-chart'),
                  margin = {top: 0, right: 0, bottom: 0, left: 0},
                  padding = 4

            const svg = root.append('svg'),
                  g = svg.append('g').attr(
                    'transform', `translate(${margin.left},${margin.top})`
                  )

            const data = self.data.series ?
                self.data : { series: [] }

            function resize () {
                const n = root.node(),
                      width = n.offsetWidth - margin.left - margin.right,
                      height = n.offsetHeight - margin.top - margin.bottom - padding,
                      x = scales.scaleTime().rangeRound([0, width]),
                      y = scales.scaleLinear().rangeRound([height, 0])

                x.domain(arr.extent(data.series.map((d) => d.day)))
                y.domain([0, arr.max(data.series.map((d) => d.metric))])

                const line = shape.line()
                    .x((d) => x(d.day))
                    .y((d) => y(d.metric))
                    .curve(shape.curveBundle.beta(0.3))

                svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight)
                g.attr('width', width).attr('height', height)
                // console.log('resized ' + width, height)
                g.append('path').datum(data.series)
                    .attr('d', line)
                    .style('stroke', self.data.darkColor)
                    .style('stroke-width', '2px')
                    .style('fill', 'none')
            }
            resize()
            // TODO: get this to resize cleanly d3.select(window).on('resize', resize)
        },
    }
}
</script>

<style>
/*.widget.column g.month-ticks { display: none; }
//.widget.column:hover g.month-ticks { display: block; }
*/
.line-chart {
    width: 100%;
    height: 74px;
    margin-top: 8px;
}
</style>

<template>
<div>
    <div class="ui medium statistic">
        <div class="label">{{metricData.fullName}}</div>
        <div class="value">{{lastMonth.total | kmb}}</div>
    </div>
    <div>
        <span class="subdued">{{getMonthValue(lastMonth.month)}}</span>

        <span class="change label">
            <arrow-icon :value="changeMoM"/>
            {{changeMoM}} % month over month
        </span>
    </div>
    <div class="bar-chart">
    </div>
    <div class="ui horizontal small statistic">
        <div class="value">
            {{lastYear.total | kmb}}
        </div>
        <div class="change label">
            <arrow-icon :value="changeYoY"/>
            {{changeYoY}} % year over year
        </div>
    </div>
    <div class="year total subdued">
        Year Total ({{lastYear.month.split('-')[0]}})
    </div>
</div>
</template>

<script>
import _ from 'lodash'
import ArrowIcon from '../ArrowIcon'
import * as d3 from 'd3-selection'
import * as scales from 'd3-scale'
import * as arr from 'd3-array'

const months = [null, 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export default {
    name: 'metric-bar-widget',
    props: ['metricData', 'graphModel'],

    components: {
        ArrowIcon,
    },

    mounted () {
        this.drawChart()
    },

    computed: {
        lastMonth: function () {
            return _.last(this.graphData);
        },
        lastYear: function () {
            return this.graphData[_.indexOf(this.graphData, this.lastMonth) - 12]
        },
        changeMoM: function () {
            const data = this.graphData;
            const prev = data[data.length - 2];
            const diff = this.lastMonth.total - prev.total;
            return ((diff / prev.total) * 100).toFixed(2);
        },
        changeYoY: function () {
            const diff = this.lastMonth.total - this.lastYear.total;
            return ((diff / this.lastYear.total) * 100).toFixed(2);
        },
        graphData: function () {
            return this.graphModel.getGraphData();
        }
    },

    methods: {

        drawChart () {
            const self = this

            const root = d3.select(this.$el).select('.bar-chart'),
                  margin = {top: 16, right: 0, bottom: 8, left: 0},
                  padding = 4

            const svg = root.append('svg'),
                  g = svg.append('g').attr(
                    'transform', `translate(${margin.left},${margin.top})`
                  )

            const data = self.metricData.series ?
                self.metricData : { series: [] }

            const rowData = this.graphModel.getGraphData();

            function resize () {
                const n = root.node(),
                      width = n.offsetWidth - margin.left - margin.right,
                      height = n.offsetHeight - margin.top - margin.bottom - padding,
                      x = scales.scaleBand().rangeRound([0, width]).padding(0.3),
                      y = scales.scaleLinear().rangeRound([height, 0])

                x.domain(rowData.map((d) => d.month))
                y.domain([0, arr.max(rowData.map((d) => d.total))])

                svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight)
                g.attr('width', width).attr('height', height)
                const lastMonth = rowData[rowData.length - 1].month;
                g.append('g').selectAll('.bar').data(rowData)
                    .enter().append('rect')
                        .attr('x', (d) => x(d.month))
                        .attr('y', (d) => y(d.total))
                        .attr('width', x.bandwidth())
                        .attr('height', (d) => height - y(d.total))
                        .attr('fill', (d) =>
                            d.month === lastMonth ?
                                self.metricData.darkColor : self.metricData.lightColor
                        )

                g.append('g').classed('month-ticks', true)
                    .attr('transform', `translate(${
                                            x.bandwidth() / 2 - 3
                                        },${12})`)
                    .selectAll('.month').data(rowData)
                    .enter().append('text')
                        .attr('x', (d) => x(d.month))
                        .attr('y', height)
                        .text((d) => {
                            return self.getMonthValue(d.month);
                        }).style('fill', '#898989')
                          .style('font-size', '9px')
                          .style('font-family', 'Lato')
            }
            resize()
            // TODO: get this to resize cleanly d3.select(window).on('resize', resize)
        },
        getMonthValue (date) {
            return months[parseInt(date.split('-')[1])]
        }
    }
}
</script>

<style>
.widget.column g.month-ticks { display: none; }
.widget.column:hover g.month-ticks { display: block; }

.bar-chart {
    width: 100%;
    height: 74px;
    margin-top: 8px;
}
</style>

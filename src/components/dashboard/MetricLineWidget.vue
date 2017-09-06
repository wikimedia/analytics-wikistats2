<template>
<div>
    <div class="line-chart">
        <svg>
            <g></g>
        </svg>
    </div>
</div>
</template>

<script>
import ArrowIcon from '../ArrowIcon'
import * as d3 from 'd3-selection'
import * as scales from 'd3-scale'
import * as arr from 'd3-array'
import * as shape from 'd3-shape'
import config from '../../config'

export default {
    name: 'metric-line-widget',
    props: ['metricData', 'graphModel'],

    components: {
        ArrowIcon,
    },

    mounted () {
        this.drawChart();
    },

    updated () {
        this.drawChart();
    },

    methods: {

        drawChart () {
            const self = this;

            const root = d3.select(this.$el).select('.line-chart'),
                  margin = {top: 0, right: 0, bottom: 0, left: 0},
                  padding = 4;

            const svg = root.select('svg'),
                  g = svg.select('g').attr(
                    'transform', `translate(${margin.left},${margin.top})`
                  );
            g.selectAll('*').remove();

            const rowData = this.graphModel.getGraphData().map((row) => {
                const splitDate = row.month.split('-');
                return {
                    total: row.total,
                    month: new Date(splitDate[0], splitDate[1], splitDate[2])
                };
            });

            function resize () {
                g.html("");
                const n = root.node(),
                      width = n.offsetWidth - margin.left - margin.right,
                      height = n.offsetHeight - margin.top - margin.bottom - padding,
                      x = scales.scaleTime().rangeRound([0, width]),
                      y = scales.scaleLinear().rangeRound([height, 0]);

                x.domain(arr.extent(rowData.map((d) => d.month)));
                y.domain([arr.min(rowData.map((d) => d.total)), arr.max(rowData.map((d) => d.total))]);

                const line = shape.line()
                    .x((d) => x(d.month))
                    .y((d) => y(d.total))
                    .curve(shape.curveBundle.beta(0.3));

                svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight);
                g.attr('width', width).attr('height', height);
                g.append('path').datum(rowData)
                    .attr('d', line)
                    .style('stroke', self.metricData.darkColor)
                    .style('stroke-width', '2px')
                    .style('fill', 'none');
            }
            resize();
        },
        getMonthValue (date) {
            return config.months[parseInt(date.split('-')[1])][0];
        }
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

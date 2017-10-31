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

            const rowData = this.graphModel.getGraphData();

            function resize () {
                g.html("");
                const n = root.node(),
                      width = n.offsetWidth - margin.left - margin.right,
                      height = n.offsetHeight - margin.top - margin.bottom - padding,
                      min = Math.min(0, arr.min(rowData.map((d) => d.total))),
                      x = scales.scaleTime().rangeRound([0, width]),
                      y = scales.scaleLinear().rangeRound([height, min]);

                x.domain(arr.extent(rowData.map((d) => d.month)));
                y.domain([0, arr.max(rowData.map((d) => d.total))]);

                const area = shape.area()
                    .x((d) => x(d.month))
                    .y1((d) => y(d.total))
                    .y0(height)

                svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight);
                g.attr('width', width).attr('height', height);
                g.append('path').datum(rowData)
                    .attr('d', area)
                    .style('fill', 'url(#grad-'+self.graphModel.getArea()+')')
                    .style('stroke-width', '0');
                let gradient = g.append('linearGradient')
                    .attr('id', 'grad-'+self.graphModel.getArea())
                    .attr('x1',"0%")
                    .attr('y1',"0%")
                    .attr('x2',"0%")
                    .attr('y2',"100%")
                gradient.append('stop')
                    .attr('offset', '10%')
                    .attr('stop-color', self.metricData.lightColor);
                gradient.append('stop')
                    .attr('offset', '100%')
                    .attr('stop-color', self.metricData.lightColor)
                    .attr('stop-opacity', 0);

                const line = shape.area()
                    .x((d) => x(d.month))
                    .y((d) => y(d.total));
                g.append('path').datum(rowData)
                    .attr('d', line)
                    .style('fill', 'none')
                    .style('stroke-width', '2')
                    .style('stroke', self.metricData.darkColor);
        }
            resize();
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

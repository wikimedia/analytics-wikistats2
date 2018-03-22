<template>
<div>
    <div class="bar-chart">
        <svg>
            <g></g>
        </svg>
    </div>
</div>
</template>

<script>
import _ from '../../lodash-custom-bundle';
import ArrowIcon from '../ArrowIcon'
import * as d3 from 'd3-selection'
import * as scales from 'd3-scale'
import config from '../../config'

export default {
    name: 'metric-bar-widget',
    props: ['graphModel', 'data'],

    components: {
        ArrowIcon,
    },

    mounted () {
        this.drawChart();
    },

    watch: {
        data: function () {
            this.drawChart();
        },
    },

    methods: {

        drawChart () {

            const monthLabelFilter  = this.$options.filters.getMonthLabel;

            const self = this;

            const root = d3.select(this.$el).select('.bar-chart'),
                  margin = {top: 16, right: 0, bottom: 8, left: 0},
                  padding = 4;

            const svg = root.select('svg'),
                  g = svg.select('g').attr(
                    'transform', `translate(${margin.left},${margin.top})`
                  );
            g.selectAll('*').remove();

            const n = root.node(),
                  width = n.offsetWidth - margin.left - margin.right,
                  height = n.offsetHeight - margin.top - margin.bottom - padding,
                  x = scales.scaleBand().rangeRound([0, width]).padding(0.3),
                  y = scales.scaleLinear().rangeRound([height, 0]);

            const { min, max } = this.graphModel.getMinMax();

            x.domain(this.data.map((d) => d.month));
            y.domain([min, max]);

            svg.attr('width', n.offsetWidth).attr('height', n.offsetHeight);
            g.attr('width', width).attr('height', height);
            const lastMonth = this.data[this.data.length - 1].month;
            g.append('g').selectAll('.bar').data(this.data)
                .enter().append('rect')
                    .attr('x', (d) => x(d.month))
                    .attr('y', (d) => {
                        if (d.total >= 0) {
                            return y(d.total);
                        } else {
                            return y(0);
                        }
                    })
                    .attr('width', x.bandwidth())
                    .attr('height', (d) => {
                        return Math.abs(y(d.total) - y(0))
                    })
                    .attr('fill', (d) =>
                        d.month === lastMonth ?
                            self.graphModel.config.darkColor : self.graphModel.config.lightColor
                    );
            if (min < 0) {
                g.append('line')
                    .attr('x1', 0)
                    .attr('x2', width)
                    .attr('y1', y(0))
                    .attr('y2', y(0))
                    .style('stroke', self.graphModel.config.lightColor)
                    .style('stroke-width', 0.5);
            }

            g.append('g').classed('month-ticks', true)
                .attr('transform', `translate(${
                                        x.bandwidth() / 2 - 3
                                    },${12})`)
                .selectAll('.month').data(this.data)
                .enter().append('text')
                    .attr('x', (d) => x(d.month))
                    .attr('y', height)
                    .text((d) => {
                        return monthLabelFilter(d.month, config.months, true);
                    }).style('fill', '#898989')
                      .style('font-size', '9px')
                      .style('font-family', 'Lato');
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

<template>
<div>
    <table :class="graphModel.config.area" class="ui table">
        <thead>
            <tr v-if="['bars', 'lines'].includes(graphModel.config.type)">
                <th>Date</th>
                <th class="right aligned" v-for="v in graphModel.activeBreakdown.values" v-if="v.on">{{v.name}}</th>
            </tr>
            <tr v-if="graphModel.config.type === 'list'">
                <th class="right aligned">{{graphModel.config.valueName}}</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="['bars', 'lines'].includes(graphModel.config.type)" v-for="m in data">
                <td>{{m.month|date}}</td>
                <td class="right aligned" v-for="v in graphModel.activeBreakdown.values" v-if="v.on">{{m.total[v.key]|thousands}}</td>
            </tr>
            <tr v-if="graphModel.config.type === 'list'" v-for="m in data">
                <td class="right aligned">{{m[graphModel.config.value].total|thousands}}</td>
                <td><a target="_blank" :href="'\/\/' + $store.state.project + '/wiki/' + m[graphModel.config.key]">{{m[graphModel.config.key].replace(/_/g, ' ')}}</a></td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
    name: 'table-chart',
    props: ['data', 'graphModel'],

    mounted () {
        this.setColors();
    },

    updated () {
        this.setColors();
    },

    computed: {
        listData () {
            if (this.metricData.type === 'list') {
                return this.graphModel.topXByY(this.metricData.key, this.metricData.value).slice(0, 100);
            } else {
                return this.graphModel.getGraphData();
            }
        },
        breakdown () {
            return this.graphModel.getActiveBreakdown();
        }
    },

    methods: {
        setColors () {
            const headerCells = this.$el.querySelectorAll('th');
            let i = null;

            for (let i = 0; i < headerCells.length; i++) {
                headerCells[i].style = `background-color: ${this.graphModel.config.darkColor};`;
            }
        }
    }
}
</script>

<style scoped>
th { color: #FFFFFF!important; }
td a:hover {
    color: #6289D8;
}
td a {
    color: #000;
}
td.right.aligned {
    text-align: right;
}
</style>

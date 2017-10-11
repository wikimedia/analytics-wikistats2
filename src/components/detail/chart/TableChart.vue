<template>
<div>
    <table :class="metricData.area" class="ui table" v-if="!breakdown">
        <thead>
            <tr v-if="['bars', 'lines'].includes(metricData.type)">
                <th>Month</th>
                <th>Total</th>
            </tr>
            <tr v-if="metricData.type === 'list'">
                <th>{{metricData.valueName}}</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="['bars', 'lines'].includes(metricData.type)" v-for="m in listData">
                <td>{{m.month}}</td>
                <td>{{m.total}}</td>
            </tr>
            <tr v-if="metricData.type === 'list'" v-for="m in listData">
                <td class="right aligned">{{m[metricData.value]}}</td>
                <td><a target="_blank" :href="'\/\/' + $store.state.project + '/wiki/' + m[metricData.key]">{{m[metricData.key].replace(/_/g, ' ')}}</a></td>
            </tr>
        </tbody>
    </table>
    <table :class="metricData.area" class="ui table" v-if="breakdown">
        <thead>
            <tr>
                <th>Month</th>
                <th v-for="v in breakdown.values" v-if="v.on">{{v.name}}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="m in listData">
                <td>{{m.month}}</td>
                <td v-for="v in breakdown.values" v-if="v.on">{{m.total[v.key]}}</td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
    name: 'table-chart',
    props: ['metricData', 'graphModel'],

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
                headerCells[i].style = `background-color: ${this.metricData.darkColor};`;
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

<template>
<div>
    <table :class="metricData.area" class="ui table" v-if="!breakdown">
        <thead>
            <tr v-if="metricData.type === 'bars'">
                <th>Month</th>
                <th>Total</th>
            </tr>
            <tr v-if="metricData.type === 'list'">
                <th>Name</th>
                <th>{{metricData.valueName}}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="m in graphModel.getGraphData()" v-if="metricData.type === 'bars'">
                <td>{{m.month}}</td>
                <td>{{m.total}}</td>
            </tr>
            <tr v-for="m in metricData.sortedList" v-if="metricData.type === 'list'">
                <td>{{m.name}}</td>
                <td>{{m.value}}</td>
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
            <tr v-for="m in graphModel.getGraphData()">
                <td>{{m.month}}</td>
                <td v-for="v in breakdown.values" v-if="v.on">{{m.total[v.key]}}</td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
    name: 'map-chart',
    props: ['metricData', 'breakdown', 'graphModel'],

    mounted () {
        this.setColors()
    },

    updated () {
        this.setColors()
    },

    methods: {
        setColors () {
            const headerCells = this.$el.querySelectorAll('th')
            let i = null

            for (let i = 0; i < headerCells.length; i++) {
                headerCells[i].style = `background-color: ${this.metricData.darkColor};`
            }
        }
    }
}
</script>

<style scoped>
th { color: #FFFFFF!important; }
</style>

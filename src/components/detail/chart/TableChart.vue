<template>
<div>
    <table :class="graphModel.config.area" class="ui table">
        <thead>
            <tr v-if="graphModel.config.structure === 'timeseries'">
                <th>Date</th>
                <th class="right aligned" v-for="v in graphModel.activeBreakdown.values" v-if="v.on">{{v.name}}</th>
            </tr>
            <tr v-if="graphModel.config.structure === 'top'">
                <th class="right aligned">{{graphModel.config.value}}</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="graphModel.config.structure === 'timeseries'" v-for="m in data">
                <td>{{m.month|ISOdateUTC}}</td>
                <td class="right aligned" v-for="v in graphModel.activeBreakdown.values" v-if="v.on">{{m.total[v.key]|thousands}}</td>
            </tr>
            <tr v-if="graphModel.config.structure === 'top'" v-for="m, i in data">
                <td v-if="graphModel.config.type !== 'map'" class="right aligned">{{m.total.total|thousands}}</td>
                <td v-else class="right aligned">{{m.total.total|kmb}}</td>
                <td>
                    <a v-if="graphModel.config.type !== 'map'" target="_blank" :href="'\/\/' + $store.state.project + '/wiki/' + m[graphModel.config.key]">
                        {{elementName(i)}}
                    </a>
                    <span v-else>
                        {{elementName(i)}}
                    </span>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
import isoLookup from './MapChart/isoLookup'
export default {
    name: 'table-chart',
    props: ['data', 'graphModel'],

    mounted () {
        this.setColors();
    },

    updated () {
        this.setColors();
    },

    methods: {
        elementName (i) {
            const rawName = this.data[i][this.graphModel.config.key].replace(/_/g, ' ');
            if (this.graphModel.config.type === 'map') {
                const result = isoLookup[rawName];
                return (result && result.en) || rawName;
            } else {
                return rawName;
            }
        },
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

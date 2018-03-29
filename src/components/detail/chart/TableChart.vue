<template>
<div>
    <table :class="graphModel.config.area" class="ui table unstackable">
        <caption align="bottom" @click="advancePage()" class = "morerows" colspan="10">Load more rows...</caption>
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
            <tr v-if="graphModel.config.structure === 'timeseries'" v-for="m in valuesShown(data, currentPage)">
                <td>{{m.month|ISOdateUTC}}</td>
                <td class="right aligned" v-for="v in graphModel.activeBreakdown.values" v-if="v.on">{{m.total[v.key]|thousands}}</td>
            </tr>
            <tr v-if="graphModel.config.structure === 'top'" v-for="m, i in valuesShown(data, currentPage)">
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
    data () {
        return {
            currentPage: 0
        }
    },

    mounted () {
        this.setColors();
    },

    updated () {
        this.setColors();
    },

    computed: {
        mobile(){
            return this.$mq == 'mobile';
        }
    },

    methods: {
        elementName (i) {
            const data = this.valuesShown(this.data, this.currentPage);
            const rawName = data[i][this.graphModel.config.key].replace(/_/g, ' ');
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
        },
        valuesShown(data, page){
            if (data){
                const itemsPerPage = this.mobile ? 10 : 20;
                return data.slice(0, page * itemsPerPage + itemsPerPage);
            }
        },
        advancePage(){
            this.currentPage++;
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
.morerows {
    background-color: lightgray;
    text-align: center!important;
    cursor: pointer;
    height: 40px;
    line-height: 40px;
}
</style>

<template>
<div>
    <table :class="graphModel.config.area" class="ui table unstackable">
        <caption align="bottom" @click="advancePage()" v-if="loadMoreRows" class="morerows" colspan="10">Load more rows...</caption>
        <thead>
            <tr v-if="graphModel.config.structure === 'timeseries'">
                <th>Date</th>
                <th class="right aligned" v-for="v in graphModel.activeBreakdown.values" v-if="v.on">{{v.name | capitalize}}</th>
            </tr>
            <tr v-if="graphModel.config.structure === 'top'">
                <th class="right aligned">{{(graphModel.config.valueTitle || graphModel.config.value) | capitalize}}</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="graphModel.config.structure === 'timeseries'" v-for="m in valuesShown">
                <td>{{m.month | ISOdateUTC(granularityFormat)}}</td>
                <td class="right aligned" v-for="v in graphModel.activeBreakdown.values" v-if="v.on">{{m.total[v.key]|thousands}}</td>
            </tr>
            <tr v-if="graphModel.config.structure === 'top'" v-for="m, i in valuesShown">
                <td v-if="graphModel.config.type !== 'map'" class="right aligned">{{m.total.total|thousands}}</td>
                <td v-else class="right aligned">{{m.total.total|kmb}}</td>
                <td>
                    <a v-if="graphModel.config.type !== 'map'" target="_blank" :href="generateLink(m[graphModel.config.key])">
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
import utils from '../../../utils'

export default {
    name: 'table-chart',
    props: ['graphModel'],
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
        },
        totalItems(){
            const itemsPerPage = this.mobile ? 10 : 20;
            return this.currentPage * itemsPerPage + itemsPerPage;
        },
        valuesShown(){
            if (this.graphModel.graphData){
                return this.graphModel.graphData.slice(0, this.totalItems);
            }
        },
        loadMoreRows(){
            if (this.graphModel.graphData && this.totalItems < this.graphModel.graphData.length){
                return true;
            }
        },
        granularityFormat () {
            return utils.getDateFormatFromData(this.graphModel.graphData);
        },
    },

    methods: {
        elementName (i) {
            const rawName = this.valuesShown[i][this.graphModel.config.key].replace(/_/g, ' ');
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
        advancePage(){
            this.currentPage++;
        },
        generateLink (elementName) {
            const transformation = {
                'user_text': (e) => '\/\/' + this.$store.state.project + '/wiki/User:' + e
            }[this.graphModel.config.key];
            if (transformation) {
                return transformation(elementName);
            } else return '\/\/' + this.$store.state.project + '/wiki/' + elementName;
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

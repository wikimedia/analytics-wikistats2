<template>
<div>
    <table :class="graphModel.config.area" class="ui table unstackable">
        <caption align="bottom" @click="advancePage()" v-if="loadMoreRows" class="morerows" colspan="10">Load more rows...</caption>
        <thead>
            <tr v-if="isTimeseries">
                <th>Date</th>
                <th class="right aligned" v-for="v in graphModel.activeBreakdown.values" v-if="v.on">{{v.name | capitalize}}</th>
            </tr>
            <tr v-if="isTop">
                <th class="right aligned">{{(graphModel.config.valueTitle || graphModel.config.value) | capitalize}}</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="isTimeseries" v-for="m in valuesShown">
                <td>{{m.month | ISOdateUTC(granularityFormat)}}</td>
                <td class="right aligned" v-for="v in graphModel.activeBreakdown.values" v-if="v.on">{{m.total[v.key]|thousands}}</td>
            </tr>
            <tr v-if="isTop" v-for="m, i in valuesShown">
                <td v-if="isMap" class="right aligned">{{m.total.total|thousands}}</td>
                <td v-else class="right aligned">{{m.total.total|kmb}}</td>
                <td>
                    <a v-if="isMap" target="_blank" :href="generateLink(m[graphModel.config.key])">
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
            currentPage: 1
        }
    },

    mounted () {
        this.setColors();
    },

    updated () {
        this.setColors();
    },

    computed: {
        isTop () {
            return this.graphModel.config.structure === 'top';
        },
        isTimeseries () {
            return this.graphModel.config.structure === 'timeseries';
        },
        isMap () {
            return this.graphModel.config.type !== 'map';
        },
        mobile () {
            return this.$mq == 'mobile';
        },
        itemsToShow () {
            const itemsPerPage = this.mobile ? 10 : 20;
            return this.currentPage * itemsPerPage;
        },
        length () {
            return this.graphModel.graphData ? this.graphModel.graphData.length : 0;
        },
        valuesShown () {
            if (!this.length) {
                return [];
            }

            const start = this.isTop ? 0 : Math.max(this.length - this.itemsToShow, 0),
                  end = this.isTop ? this.itemsToShow : this.length,
                  results = this.graphModel.graphData.slice(start, end);

            return this.isTop ? results : results.reverse();
        },
        loadMoreRows () {
            return this.length > this.itemsToShow;
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
        advancePage () {
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

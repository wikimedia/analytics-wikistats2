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
        },
        totalItems(){
            const itemsPerPage = this.mobile ? 10 : 20;
            return this.currentPage * itemsPerPage + itemsPerPage;
        },
        valuesShown(){
            if (this.data){
                return this.data.slice(0, this.totalItems);
            }
        },
        loadMoreRows(){
            if (this.data && this.totalItems < this.data.length){
                return true;
            }
        },
        granularityFormat () {
            return utils.getDateFormatFromData(this.data);
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


/*
const snapIndex = -1;

// Snap annotation dates to the closest data point
var snappedAnnotations = annotations.rowData().map(function (a) {

    // Efficiently iterate data points to find closest one
    for (var i = snapIndex + 1; i < rows.length; i++) {
        if (a[0] >= rows[i][0].getTime()) {
            snapIndex = i;
        } else {
            break;
        }
    }

    // Format annotation
    var snappedDate, message;
    if (snapIndex === -1) {
        // The annotation is set before the first data point.
        // Attach it to the first data point, prefixed with its date.
        snappedDate = rows[0][0].getTime();
        message = moment(a[0]).utc().format('YYYY-MM-DD ') + a[1];
    } else if (snapIndex === rows.length - 1) {
        // The annotation is set after the last data point.
        // Attach it to the last data point, prefixed with its date.
        snappedDate = rows[rows.length - 1][0].getTime();
        message = moment(a[0]).utc().format('YYYY-MM-DD ') + a[1];
    } else {
        // The annotation is set in between two data points.
        // Attach it to the earlier data point, no prefix.
        snappedDate = rows[snapIndex][0].getTime();
        message = a[1];
    }

    return [snappedDate, message];
});
*/

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

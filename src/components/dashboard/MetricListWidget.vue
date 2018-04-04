<template>
<div>
    <div class="ui medium statistic">
        <div class="label">{{graphModel.config.fullName}}</div>
    </div>
    <div class="subdued">
        {{graphModel.config.subtitle + ' for ' + lastMonth}}
    </div>
    <table class="widget list">
        <tr v-for="(item, i) in sortedList">
            <td class="number">{{item.total.total | kmb}}</td>
            &nbsp;
            <td class="label">

                <a v-if="graphModel.config.type !== 'map'" v-on:click.stop target="_blank" :href="getLink(item)">
                    {{elementName(i)}}
                </a>
                <span v-else>
                    {{elementName(i)}}
                </span>
            </td>
        </tr>
    </table>
</div>
</template>

<script>
import _ from '../../lodash-custom-bundle';
import Vue from 'vue';
import config from '../../config';
import isoLookup from '../detail/chart/MapChart/isoLookup';

export default {
    name: 'metric-list-widget',
    props: ['graphModel', 'data'],

    computed: {
        lastMonth () {
            let graphModel = this.graphModel;
            let date =_.last(graphModel.graphData);
            date = date.month;
            return config.months[date.getUTCMonth() + 1];
        },
        sortedList () {
            return this.data.slice(0, 4);
        }
    },
    methods: {
        elementName (i) {
            const rawName = this.sortedList[i][this.graphModel.config.key].replace(/_/g, ' ');
            if (this.graphModel.config.type === 'map') {
                return isoLookup[rawName].en;
            } else {
                return rawName;
            }
        },

        getLink (item) {
            return '\/\/' + this.$store.state.project + '/wiki/' + item[this.graphModel.config.key];
        }
    }
};
</script>

<style>
.widget.list {
    table-layout: fixed;
    width: 100%;
    list-style: none;
    font-size: 1.4em;
    padding: 0;
    margin: 0;
    color: #4a4a4a;
    border-collapse: collapse;
}
.widget.list tr {
    height: 45px;
    margin: 10px 10px 0 0;
    padding-bottom: 10px;
    vertical-align: middle;
    border-bottom: 2px solid #bbb;
    white-space: nowrap;
}
.widget.list a {
    color: #000;
}
.widget.list a:hover {
    color: #6289D8;
}
.widget.list tr:last-child {
    border: none;
    max-width: 200px;
}
.widget.list .number {
    font-size: 18px;
    font-weight: 600;
}
.widget.list .label {
    width: 60%;
    font-size: 20px;
    font-weight: normal;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>

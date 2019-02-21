<template>
<div>
    <table class="widget list">
        <tr v-for="(item, i) in sortedList">
            <td class="number">{{item.total.total | kmb}}</td>
            &nbsp;
            <td class="label">
                <table-name-cell :index="i" :value="item" :nameKey="graphModel.config.key"/>
            </td>
        </tr>
    </table>
</div>
</template>

<script>
import _ from 'Src/lodash-custom-bundle';
import Vue from 'vue';
import config from 'Src/config';

import TableNameCell from 'Src/components/detail/chart/TableNameCell';

export default {
    name: 'metric-list-widget',
    props: ['graphModel', 'data'],
    components : {TableNameCell},

    computed: {
        sortedList () {
            return this.data.slice(0, 4);
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

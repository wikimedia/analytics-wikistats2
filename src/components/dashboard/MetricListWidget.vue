<template>
<div>
    <div class="ui medium statistic">
        <div class="label">{{graphModel.config.fullName}}</div>
    </div>
    <div class="subdued">
        {{graphModel.config.subtitle + ' for ' + currentMonth}}
    </div>
    <table class="widget list">
        <tr v-for="(item, i) in sortedList">
            <td class="number">{{item.views.total | kmb}}</td>
            &nbsp;
            <td class="label">
                <a v-on:click.stop target="_blank" :href="'\/\/' + $store.state.project + '/wiki/' + item.article">
                    {{item.article.replace(/_/g, ' ')}}
                </a>
            </td>
        </tr>
    </table>
</div>
</template>

<script>
import Vue from 'vue';
import config from '../../config';

export default {
    name: 'metric-list-widget',
    props: ['graphModel', 'data'],

    computed: {
        currentMonth () {
            return config.months[new Date().getMonth()];
        },
        sortedList () {
            return this.data.slice(0, 4);
        }
    }
};
</script>

<style>
.widget.list {
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
.widget.list tr:last-child { border: none; }
.widget.list .number {
    font-size: 25px;
    font-weight: 600;
}
.widget.list .label {
    font-size: 20px;
    font-weight: normal;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>

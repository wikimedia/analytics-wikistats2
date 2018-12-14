<template>
<div v-if="graphModel">
    <h3 class="header" v-hint:filterAndSplit>{{header}}</h3>
    <div v-for="b, i in graphModel.breakdowns" class="breakdown">
        <div class="ui radio checkbox">
            <input
                type="radio"
                :id="'breakdown' + b.breakdownName"
                v-model="graphModel.activeBreakdown"
                :value="b">
            <label :for="'breakdown' + b.breakdownName">
                <span v-if="b.total">
                    Overall <strong>{{b.name.toLocaleLowerCase()}}</strong>
                    <i class="help circle icon" title="See the overall total"/>
                </span>
                <span v-else>
                    {{operation}} by <strong>{{b.name.toLocaleLowerCase()}}</strong>
                    <i class="help circle icon" title="Split the total into parts to see more detail.  Filter to the parts you're interested in using the checkboxes."/>
                </span>
            </label>
        </div>
        <div v-if="!b.total && isActive(b)">
            <div v-if="mode === 'timeseries'">
                <label class="xui checkbox" :class="{active: isActive(b)}"
                       v-for="bv in b.values">
                    <input type="checkbox" v-model="bv.on" :disabled="!isActive(b)"/>
                    <span v-hint:breakdown="bv.key">{{bv.name}}</span>
                </label>
            </div>
            <div v-if="mode === 'top'" v-for="bv in b.values">
                <label class="xui radio checkbox filter" :class="{active: isActive(b)}">
                    <input type="radio" v-model="activeFilter" :value="bv" :disabled="!isActive(b)"/>
                    <span v-hint:breakdown="bv.key">{{bv.name}}</span>
                </label>
            </div>
        </div>
    </div>
</div>
</template>

<script>
    import utils from '../../utils';

    export default {
        name: 'breakdowns',
        props: ['graphModel'],
        watch: {
            activeFilter () {
                // If the metric is top, enforce only one breakdown being active.
                this.graphModel.activeBreakdown.values
                    .forEach(bv => bv.on = bv.key === this.activeFilter.key);
            }
        },
        data () {
            return {
                activeFilter: null
            }
        },

        mounted () {
            if (this.mode === 'top') {
                this.activeFilter = this.graphModel.activeBreakdown.values.find(
                    b => b.on && b.key != 'total'
                ) || null;
            }
        },

        methods: {
            isActive (b) {
                return b === this.graphModel.activeBreakdown;
            }
        },

        computed: {
            header () {
                return this.mode === 'top' ? 'Filter' : 'Filter and Split';
            },
            mode () {
                return this.graphModel.config.structure;
            },
            operation () {
                return this.mode === 'top' ? 'Filter' : 'Split';
            }
        }
    }
</script>

<style>
.breakdown .ui.radio.checkbox > label { cursor: pointer!important; padding-left: 1.7em; }
.ui.radio.checkbox { margin-top: 10px; display:block;}
.xui.checkbox.filter {
    margin-left: 10px;
}
.xui.radio.checkbox.filter input[type="radio"]{
    margin-right: 5px;
}
</style>

<template>
<div v-if="graphModel">

    <h3 class="header">Filter and split</h3>

    <div v-for="b, i in graphModel.breakdowns" class="breakdown">
        <div class="ui toggle checkbox">
            <input
                type="radio"
                :id="'breakdown' + b.breakdownName"
                v-model="graphModel.activeBreakdown"
                :value="b">
            <label :for="'breakdown' + b.breakdownName">
                <span v-if="b.total">
                    Overall <strong>{{b.name.toLowerCase()}}</strong>
                    <i class="help circle icon" title="See the overall total"/>
                </span>
                <span v-else>
                    Split by <strong>{{b.name.toLowerCase()}}</strong>
                    <i class="help circle icon" title="Split the total into parts to see more detail.  Filter to the parts you're interested in using the checkboxes."/>
                </span>
            </label>
        </div>

        <div v-if="!b.total && isActive(b)">
            <label class="xui checkbox" :class="{active: isActive(b)}"
                   v-for="bv in b.values">

                <input type="checkbox" v-model="bv.on" :disabled="!isActive(b)"/>
                {{bv.name}}
            </label>
        </div>
    </div>
</div>
</template>

<script>
    import utils from '../../utils';

    export default {
        name: 'breakdowns',
        props: ['graphModel'],

        methods: {
            isActive (b) {
                return b === this.graphModel.activeBreakdown;
            }
        },
    }
</script>

<style>
.breakdown .ui.toggle.checkbox > label { cursor: pointer!important; padding-left: 4em; }
.ui.toggle.checkbox { margin-top: 10px; }
.ui.toggle.checkbox input:checked ~ label:before {
    background-color: #227634!important;
}
</style>

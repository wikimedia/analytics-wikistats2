<template>
<div v-if="graphModel">
    <div class="ui clearing divider"></div>

    <h3 class="header">Filter and Split</h3>

    <div v-for="b, i in graphModel.getBreakdowns()" class="breakdown">
        <div class="ui toggle checkbox">
            <input
                type="checkbox"
                :id="'breakdown' + b.breakdownName"
                v-model="b.on"
                @click="breakdownToggled(i)"
                :checked="shouldBeChecked(i)">
            <label :for="'breakdown' + b.breakdownName">
                Split by <strong>{{b.name}}</strong>
                <i class="help circle icon" title="Split the total into parts to see more detail.  Filter to the parts you're interested in using the checkboxes."/>
            </label>
        </div>

        <label class="xui checkbox" v-for="bv in b.values">
            <input type="checkbox" v-model="bv.on" :disabled="!b.on"/>
            {{bv.name}}
        </label>
    </div>
</div>
</template>

<script>
    export default {
        name: 'breakdowns',
        props: ['graphModel'],
        methods: {
            breakdownToggled (index) {
                this.graphModel.getBreakdowns().forEach((b, i) => {
                    if(i != index) {
                        this.graphModel.getBreakdowns()[i].on = false;
                    }
                })
                this.updateState();
            },
            shouldBeChecked (index) {
                // HORRIBLE, this shouldn't have side effects
                if(!this.graphModel.getBreakdowns()[index].values.some(b => b.on)) {
                    this.graphModel.getBreakdowns()[index].values.forEach(v => {
                        v.on = true;
                    })
                    this.graphModel.getBreakdowns()[index].on = false;
                }
            },
            updateState () {
                this.$store.state.breakdowns = JSON.parse(JSON.stringify(this.graphModel.getBreakdowns()));
            }
        }
    }
</script>

<style>
.breakdown .ui.toggle.checkbox > label { cursor: pointer!important; padding-left: 4em; }
.ui.toggle.checkbox { margin-top: 10px; }
.ui.toggle.checkbox input:checked ~ label:before {
    background-color: #227634!important;
}
</style>

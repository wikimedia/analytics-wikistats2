<template>
<div v-if="graphModel">
    <div class="ui clearing divider"></div>

    <h3 class="header">Filters and Breakdowns</h3>

    <div v-for="b, i in graphModel.getBreakdowns()">
        {{b.name}}
        <label class="xui checkbox" v-for="bv in b.values">
            <input type="checkbox" v-model="bv.on" :disabled="!b.on"/>
            {{bv.name}}
        </label>

        <div class="ui toggle checkbox">
            <input
                type="checkbox"
                id="breakdown"
                v-model="b.on"
                @click="breakdownToggled(i)"
                :checked="shouldBeChecked(i)">
            <label for="breakdown">
                Breakdown
                <span v-if="!b.on">Off</span>
                <span v-if="b.on">On</span>
                <i class="help circle icon" title="Breakdowns help you see more detail by breaking down the total values into parts."/>
            </label>
        </div>
    </div>
</div>
</template>

<script>
    export default {
        name: 'breakdowns',
        props: ['graphModel'],
        methods: {
            breakdownToggled (index) {
                if (this.graphModel.getBreakdowns()[index].on) {
                    this.graphModel.getBreakdowns().forEach((b, i) => {
                        if(i != index) {
                            this.graphModel.getBreakdowns()[i].on = false;
                        }
                    })
                }
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

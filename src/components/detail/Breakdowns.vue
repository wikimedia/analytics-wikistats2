<template>
<div v-if="breakdowns">
    <div class="ui clearing divider"></div>

    <h3 class="header">Filters and Breakdowns</h3>

    <div v-for="b, i in breakdowns">
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
        props: ['breakdowns'],
        watch: {
            breakdowns: function () {
                this.shouldBeChecked();
            }
        },
        methods: {
            breakdownToggled (index) {
                if (this.breakdowns[index].on) {
                    this.breakdowns.forEach((b, i) => {
                        if(i != index) {
                            this.breakdowns[i].on = false;
                        }
                    })
                }
            },
            shouldBeChecked (index) {
                // HORRIBLE, this shouldn't have side effects
                if(!this.breakdowns[index].values.some(b => b.on)) {
                    this.breakdowns[index].values.forEach(v => {
                        v.on = true;
                    })
                    this.breakdowns[index].on = false
                }
            }
        }
    }
</script>
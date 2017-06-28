<template>
<section class="widgets">
    <div class="ui clearing basic top segment">
        <h2 class="ui left floated header">Monthly Overview</h2>
        <h5 class="ui right floated header">
            <wiki-selector :wiki="wiki" single="true" @wiki="wiki" ></wiki-selector>
        </h5>
    </div>
    <div class="ui basic area segment"
        v-for="a in areas"
        :key="a.state.id">
        <dashboard-area :wiki="wiki" :area="a.state"></dashboard-area>
    </div>
</section>
</template>

<script>
import DashboardArea from './DashboardArea'
import WikiSelector from '../WikiSelector'
import config from '../../apis/Configuration'

export default {
    name: 'dashboard',
    props: ['wiki'],
    components: {
        DashboardArea,
        WikiSelector,
    },

    data () {
        return {
            areas: []
        };
    },

    mounted () {
        $('body').scrollTop(0)
        this.load()
    },

    methods: {
        wiki (wiki) {
            this.$emit('wiki', wiki)
        },
        load () {
            const self = this
            config.areaData().then(function (result) {
                self.areas = result
            })
        },
    },
}
</script>

<style>
.widgets { padding: 0; margin: 0; }
.widgets > .segment { padding: 0; }

.widgets > .top.segment { margin-top: 10px; margin-bottom: 0; padding-bottom: 0 }
.widgets > .ui.area.segment:first-child { margin-top: 0; }
.left.floated.header {
    font-size: 30px;
    font-weight: 500;
}
.right.floated.header { margin-right: 0; }
.right.floated.header .ui.icon.input { margin-right: 0; }

.widgets .ui.input {
    width: 260px;
}
.widgets .ui.input > input {
    border: 1px solid #aaa9a9;
    border-radius: 4px;
    height: 48px;
    color: #4A4A4A;
    font-size: 17px;
}
</style>

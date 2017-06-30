<template>
<section class="widgets">
    <div class="ui clearing basic top segment">
        <h2 class="ui left floated header">Monthly Overview</h2>
        <h5 class="ui right floated header">
            <wiki-selector :single="true"></wiki-selector>
        </h5>
    </div>
    <div class="ui basic area segment"
        v-for="a in areas"
        :key="a.state.id">
        <dashboard-area :area="a.state"></dashboard-area>
    </div>
</section>
</template>

<script>
import { mapState } from 'vuex';
import router from '../../router'

import DashboardArea from './DashboardArea';
import WikiSelector from '../WikiSelector';


export default {
    name: 'dashboard',
    components: {
        DashboardArea,
        WikiSelector,
    },

    computed: mapState([
        'areas',
        'project',
    ]),

    watch: {
        '$store.getters.projectCode': function () {
            const newCode = this.$store.getters.projectCode;

            if (this.$route.params.wikiCode !== newCode) {
                router.push('/' + newCode);
            }
        },
    },

    mounted () {
        $('body').scrollTop(0);

        this.$store.dispatch('setProjectByCode', { family: 'all', code: 'all-projects' });
        this.$store.dispatch('setAreasByConfig');
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

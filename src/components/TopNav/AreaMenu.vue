<template>
    <div v-if="compact" class="ui right floated header mobile">
        <i class="ui icon bars blue small" @click="toggleMenu()"/>
        <div @blur="toggleMenu()" class="ui vertical pointing menu" @click="toggleMenu()" v-if="!collapsed">
            <router-link
                v-for="a in areas"
                :key="a.name"
                class="item"
                :class="{active: wikiCode === $store.state.project && a.path === $store.state.area}"
                :to="{project: wikiCode, area: a.path}">
                {{a.name}}
            </router-link>
        </div>
    </div>
    <div v-else class="ui right floated header">
        <span class = "head link" v-for="a in areas">
            <router-link :to="{project: wikiCode, area: a.path}">{{a.name}}</router-link>
        </span>
    </div>
</template>

<script type="text/javascript">
    import RouterLink from '../RouterLink';
    import config from '../../config';
    export default {
        props: [ 'wikiCode' ],
        components: {
            RouterLink,
        },
        data () {
            return {
                areas: [],
                collapsed: true
            };
        },
        mounted () {
            this.areas = config.areas();
        },
        methods: {
            toggleMenu () {
                this.collapsed = !this.collapsed;
            }
        },
        computed: {
            compact () {
                return ['mobile', 'tablet'].indexOf(this.$mq) > -1;
            }
        }
    }
</script>

<style type="text/css">
    .ui.right.floated.header{
        margin-top: 0.5em;
    }
    .ui.right.floated.header > .head.link {
        padding: 10px;
    }
    .ui.vertical.pointing.menu {
        position: absolute;
        top: 77px;
        left: 0;
        width: 100% ;
    }
    .mobile {
        line-height: 47px;
        vertical-align: middle;
    }
    .mobile i {
        line-height: 47px!important;
    }
</style>
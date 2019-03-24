<template>
    <div v-if="large" class="ui right floated header">
        <span class="head link" v-for="a in areas">
            <router-link :to="{project: wikiCode, area: a.path}">{{a.name}}</router-link>
        </span>
        <span class="head link all">
            <router-link :to="{project: wikiCode, section: 'metrics'}">All Metrics</router-link>
        </span>
    </div>
    <div v-else class="ui right floated header tablet" :class="{mobile: mobile}">
        <i class="ui icon bars blue small" @click="toggleMenu"/>
        <div @blur="toggleMenu" class="ui vertical pointing menu" @click="toggleMenu" v-if="!collapsed">
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

            large () {
                return this.$mq === 'lg';
            },
            mobile () {
                return this.$mq === 'mobile';
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
    .ui.right.floated.header.tablet {
        margin-right: 0px;
    }
    .ui.right.floated.header.tablet.mobile {
        margin-right: 8px;
    }
    .ui.right.floated.header.tablet i.icon {
        line-height: 47px;
        cursor: pointer;
    }
    .ui.right.floated.header.tablet i.icon:only-child {
        display: table-cell;
    }
</style>

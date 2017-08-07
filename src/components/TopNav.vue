<template>
<div>
    <a @click.prevent="$store.commit('resetState', { project: $store.state.project })" href="#" exact>
        <h1 class="ui left floated title header">
            <span class="ui mini image">
                    <img src="../assets/Wikimedia-logo.svg">
            </span>
            <span class="text">Wikimedia Statistics</span>
        </h1>
    </a>
    <div class="ui right floated link header">
        <span v-for="a in areas">
            <a v-if="a.exact" href="#" :key="a.name"
             @click.prevent="$store.commit('resetState', {project: wikiCode, area: a.path})" exact>
                {{a.name}}
            </a>
            <a v-else href="#" :key="a.name"
             @click.prevent="$store.commit('resetState', {project: wikiCode, area: a.path})">
                {{a.name}}
            </a>
        </span>
    </div>
</div>
</template>

<script>
import config from '../config'

export default {
    name: 'top-nav',
    props: [ 'wikiCode' ],
    data () {
        return {
            areas: []
        };
    },

    mounted () {
        this.areas = config.areas();
    },
}
</script>

<style scoped>
.ui.mini.image { width: 46px; height: 46px; }
.title.header {
    padding: 0;
    margin: 0;
}
.title.header > .text {
    position: absolute;
    left: 101px;
    top: 44px;
    font-size: 25px;
    font-family: "Helvetica Neue",Helvetica,Lato,"Open Sans";
}
.link.header {
    padding-top: 20px;
}
.link.header a {
    margin-left: 16px;
    font-size: 18px;
}
.router-link-active {
    cursor: default;
}
</style>

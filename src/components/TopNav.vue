<template>
<div>
    <router-link :to="{project: $store.state.project}">
        <h1 class="ui left floated title header">
            <span class="ui mini image">
                    <img src="../assets/Wikimedia-logo.svg">
            </span>
            <span class="text">Wikimedia Statistics</span>
        </h1>
    </router-link>
    <div class="ui right floated link header">
        <span v-for="a in areas">
            <router-link :to="{project: wikiCode, area: a.path}">{{a.name}}</router-link>
        </span>
    </div>
</div>
</template>

<script>
import RouterLink from './RouterLink';
import config from '../config';

export default {
    name: 'top-nav',
    props: [ 'wikiCode' ],
    data () {
        return {
            areas: []
        };
    },
    components: {
        RouterLink,
    },
    mounted () {
        this.areas = config.areas();
    },
};
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
.router-link-current {
    cursor: default;
}
</style>

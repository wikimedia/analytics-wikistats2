<template>
<div>
    <h1 class="ui left floated title header">
        <span class="ui mini image">
            <img src="../assets/Wikimedia-logo.svg">
        </span>
        <span class="text">Wikimedia Statistics</span>
    </h1>
    <div class="ui right floated link header">
        <router-link
            v-for="a in areas" :to="a.path"
            :key="a.name">
            {{a.name}}
        </router-link>
    </div>
</div>
</template>

<script>
import config from '../apis/Configuration'

export default {
    name: 'top-nav',
    data () {
        return {
            areas: []
        };
    },

    mounted () {
        this.load()
    },

    methods: {
        load () {
            const self = this
            config.areas().then(function (result) {
                self.areas = result
            })
        },
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
</style>

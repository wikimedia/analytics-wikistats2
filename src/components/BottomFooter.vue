<template>
<section class="ui three column centered grid">
    <div class="middle aligned column">
        <p>Find out more <router-link to="/about">about Wikistats</router-link> and the <router-link to="/about-data">data that it uses</router-link></p>
    </div>
    <div class="middle aligned column">
        <p>Wikistats is written with <a target="_blank" href="//vuejs.org">Vue.js</a> and <a target="_blank" href="//semantic-ui.com">Semantic UI</a>.  If you'd like to contribute, see our <a target="_blank" href="//wikitech.wikimedia.org/wiki/Analytics/Wikistats2.0">contributing guide</a>.</p>
    </div>
    <div class="middle aligned column">
        <p>Wikistats is designed by <a target="_blank" href="//aislinngrigas.com/about/">Aislinn Grigas</a>.</p>
    </div>
    <div class="row">
        <div class="eight wide middle aligned column">
            <p>All data, charts, and other content is available under the <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_new">Creative Commons CC0 dedication.</a></p>
        </div>
    </div>
</section>
</template>

<script>
export default {
  name: 'bottom-footer'
}
</script>

<style scoped>
a, a:visited { color: #777; }
</style>

<template>
<section class="ui centered grid">
    <div class="four wide middle aligned column">
        Find out more <a target="_blank" href="https://wikitech.wikimedia.org/wiki/Analytics/Wikistats2.0">about Wikistats</a><br/>
        and the <a target="_blank" href="https://wikitech.wikimedia.org/wiki/Analytics#Datasets">data it uses</a><br/>
    </div>
    <div class="eight wide middle aligned column">
        See our <a target="_blank" href="//wikitech.wikimedia.org/wiki/Analytics/Wikistats2.0#Contributing_and_Deployment">contributing guide</a> to help us build Wikistats<br/>
        We use <a target="_blank" href="//wikitech.wikimedia.org/wiki/Analytics/Wikistats2.0#Technology">Vue.js, d3, CrossFilter, and more</a><br/>
        Follow this link to <a target='_blank' href='https://phabricator.wikimedia.org/maniphest/task/edit/?title=Wikistats%20Bug&amp;projectPHIDs=Analytics-Wikistats,Analytics'>report a bug</a><br/>
    </div>
    <div class="four wide middle aligned column">
        Designed by <a target="_blank" href="//aislinngrigas.com/about/">Aislinn Grigas</a>.<br/>
    </div>
    <div class="row">
        <div class="sixteen wide middle aligned column">
            All data, charts, and other content is available under the <a target="_blank" href="https://creativecommons.org/publicdomain/zero/1.0/">Creative Commons CC0 dedication.</a><br/>
        </div>
    </div>
</section>
</template>

<script>
import RouterLink from './RouterLink';

export default {
  name: 'bottom-footer',
  components: {
    RouterLink,
  },
};
</script>

<style scoped>
a, a:visited { color: #888; }
.ui.centered { font-size: 1.1em; }
</style>

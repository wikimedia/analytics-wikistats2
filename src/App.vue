<template>
<div class="app">
    <section class="ui top attached clearing segment">
        <top-nav :wikiCode="project"></top-nav>
    </section>
    <section class="ui attached content segment">
        <topic-explorer v-if="false"></topic-explorer>

        <component :is="mainComponent"></component>
    </section>
    <section v-if="languages.length > 1" class="ui attached language segment">
        <site-language :languages="languages"></site-language>
    </section>
    <section class="ui attached footer segment">
        <bottom-footer></bottom-footer>
    </section>
</div>
</template>

<script>
import TopNav from './components/TopNav';
import TopicExplorer from './components/TopicExplorer';
import SiteLanguage from './components/SiteLanguage';
import BottomFooter from './components/BottomFooter';
import Dashboard from './components/dashboard/Dashboard';
import Detail from './components/detail/Detail';
import { mapState } from 'vuex';

export default {
    name: 'app',
    components: {
        TopNav,
        TopicExplorer,
        SiteLanguage,
        BottomFooter,
        Dashboard,
        Detail,
    },
    data () {
        return {
            languages: ['english']
        };
    },
    computed: mapState([
        'project',
        'mainComponent',
    ]),
};
</script>

<style>
a:visited { color: #6289D8; }
a { font-weight: normal; color: #3366cc; }
a.router-link-current { font-weight: bold; color: #72777d }
.ui.dropdown { background-color: #fff; }
.ui.dropdown:hover { background-color: #fff; }

.ui.top.attached.clearing.segment {
    border-bottom: 4px solid #4A4A4A;
    padding: 35px 44px;
}
.ui.attached.content.segment {
    background-color: #F6F6F6;
    /* with topic explorer: padding: 53px 32px 27px 32px; */
    /* without topic explorer: */
    padding: 2px 32px 27px 24px;
}
.ui.attached.language.segment {
    height: 70px;
    background-color: #8D8D8D;
    border: solid 1px #d4d4d5;
    border-left: solid 1px #d4d4d5;
    border-right: solid 1px #d4d4d5;
    border-bottom: none;
}
.ui.attached.footer.segment {
    background-color: #3B3B3B;
    color: #AAAAAA;
    border: none;
}

/* remove this, just making the prototype line up with the design files */
.app { max-width: 1024px; min-width: 1024px; width: 1024px; margin: 0 auto; }
</style>

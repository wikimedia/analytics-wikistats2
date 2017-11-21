<template>
<div class="app">
    <central-notice v-if="$store.state.centralNotice" />
    <section class="ui top attached clearing segment">
        <top-nav :wikiCode="project"></top-nav>
    </section>
    <section class="ui attached content segment animate">
        <topic-explorer></topic-explorer>

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
import CentralNotice from './components/CentralNotice';
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
        CentralNotice
    },
    mounted () {
        this.isAdblockerOn() && this.warnAdBlocker();
    },

    methods: {
        isAdblockerOn () {
            let adTest = document.createElement('div');
            adTest.innerHTML = '&nbsp;';
            adTest.className = 'adsbox';
            $(this.$el).append(adTest);
            return adTest.offsetHeight === 0;
        },
        warnAdBlocker () {
            this.$store.state.centralNotice = {
                message: 'Your ad blocker is preventing Wikistats from reaching the server. Disable it to be able to see all metrics correctly.',
                level: 'error'
            }
        }
    },
    data () {
        return {
            languages: ['english']
        };
    },
    computed: mapState([
        'project',
        'mainComponent',
        'topicsMinimized',
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
    /* has to have room under it to fit topic selector animation */
    z-index: 10;
}
.ui.attached.content.segment {
    background-color: #F6F6F6;
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

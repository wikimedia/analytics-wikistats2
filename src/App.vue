<template>
<div class="app">
    <central-notice v-if="$store.state.centralNotice" />
    <header class="ui top attached clearing segment">
        <top-nav :wikiCode="project"></top-nav>
    </header>
    <main class="ui attached content segment animate">
        <topic-explorer v-if="!mobile"></topic-explorer>
        <p class="loading" v-if="loadingDetail">
            Loading metric detail...
            <i class="asterisk loading icon"></i>
        </p>
        <component :is="mainComponent" ref="mainComponentEl"></component>
    </main>
    <div v-if="languages.length > 1" class="ui attached language segment">
        <site-language :languages="languages"></site-language>
    </div>
    <footer class="ui attached footer segment">
        <bottom-footer></bottom-footer>
    </footer>
    <resize-observer @notify="handleResize" />
</div>
</template>

<script>

import CentralNotice from './components/CentralNotice';
import TopNav from './components/TopNav';
import TopicExplorer from './components/TopicExplorer';
import SiteLanguage from './components/SiteLanguage';
import BottomFooter from './components/BottomFooter';
import Dashboard from './components/dashboard/Dashboard';
import MetricsMatrix from './components/MetricsMatrix';

import { mapState } from 'vuex';
import numeral from 'numeral';
import * as locales from 'numeral/locales';

import Vue from 'vue';
import 'vue-resize/dist/vue-resize.css';
import VueResize from 'vue-resize';
import VueMq from 'vue-mq';
import Vue2TouchEvents from 'vue2-touch-events'

Vue.use(Vue2TouchEvents)

Vue.use(VueMq, {
  breakpoints: {
    mobile: 450,
    compact: 750,
    tablet: 1000,
    lg: Infinity,
  }
});

Vue.use(VueResize);

    /**
    Although the specification for import() supports a dynamic importing of
    modules in the browser runtime, webpack's require.ensure()
    (which is what imports will translate to) is not dynamic and
    requires a hardcoded string to work correctly.
    webpackChunkName is not working, bundle is not getting named correctly
    (but works otherwise)
    **/

export default {

    name: 'app',

    components: {
        TopNav,
        TopicExplorer,
        SiteLanguage,
        BottomFooter,
        Dashboard,
        CentralNotice,
        MetricsMatrix,
        'detail': () => import(/* webpackChunkName: "detail" */'./components/detail/Detail'),
    },
    mounted () {
        this.isAdblockerOn() && this.warnAdBlocker();
        this.handleResize();
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
                message: `Your ad blocker is preventing Wikistats from showing you metrics, because our API uses the word "pageview".
                There are no ads on any Wikimedia sites, but to see all metrics correctly you need to disable your ad blocker for this site.`,
                level: 'error'
            }
        },
        handleResize () {
            this.$store.state.width = $('.app').width();
            Vue.prototype.$display = this.$mq;
        }
    },
    updated () {
        if (this.mainComponent === 'detail' && !(this.$refs && this.$refs.mainComponentEl)) {
            setTimeout(() => { this.loadingDetail = true; }, 400);
        } else {
            this.loadingDetail = false;
        }
    },
    data () {
        return {
            languages: ['english'],
            loadingDetail: false,
        };
    },
    computed: Object.assign(mapState([
        'project',
        'mainComponent',
        'topicsMinimized',
    ]), {
        mobile () {
            return this.$mq === 'mobile';
        }
    })
};
</script>

<style src="primer-tooltips/build/build.css"></style>
<style>

.tooltipped { cursor: pointer; }
.tooltipped::after {
    background: #ffe1ee; color: #333; box-shadow: 2px 2px 20px #333;
    font-size: 14px; font-family: Lato,"Open Sans";
}
.tooltipped::before { color: #ffe1ee; }
.tooltipped-s::before,.tooltipped-se::before,.tooltipped-sw::before {
    border-bottom-color: #ffe1ee;
}
.tooltipped-n::before,.tooltipped-ne::before,.tooltipped-nw::before {
    border-top-color: #ffe1ee;
}
.tooltipped-w::before {
    border-left-color: #ffe1ee;
}
.tooltipped-e::before {
    border-right-color: #ffe1ee;
}
.tooltipped:hover::before,.tooltipped:hover::after,.tooltipped:active::before,.tooltipped:active::after,.tooltipped:focus::before,.tooltipped:focus::after {
    animation-delay: .3s;
}

html{
    margin:0;
    padding:0;
    overflow: hidden;
}
body{
    position: absolute;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
}

a:visited { color: #6289D8; }
a { font-weight: normal; color: #3366cc; }
a.router-link-current { font-weight: bold; color: #72777d }
.ui.dropdown { background-color: #fff; }
.ui.dropdown:hover { background-color: #fff; }

.ui.top.attached.clearing.segment {
    border-bottom: 4px solid #4A4A4A;
    padding: 35px 32px 35px 44px;
    /* has to have room under it to fit topic selector animation */
    z-index: 10;
}
@media(max-width: 450px) {
    .ui.top.attached.clearing.segment {
        padding: 20px 0 20px 20px;
        /* has to have room under it to fit topic selector animation */
    }
    .ui.attached.content.segment.animate {
        padding: 0;
    }
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

.app { max-width: 1024px; width: 100%; margin: 0 auto; }

p.loading { font-size: 1.2em; padding: 1.2em; color: #72777d; }
</style>

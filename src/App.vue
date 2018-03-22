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

import CentralNotice from './components/CentralNotice';
import TopNav from './components/TopNav';
import TopicExplorer from './components/TopicExplorer';
import SiteLanguage from './components/SiteLanguage';
import BottomFooter from './components/BottomFooter';
import Dashboard from './components/dashboard/Dashboard';

import { mapState } from 'vuex';
import numeral from 'numeral';
import * as locales from 'numeral/locales';

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
        'detail': () => import(/* webpackChunkName: "detail" */'./components/detail/Detail'),
    },
    mounted () {
        this.isAdblockerOn() && this.warnAdBlocker();
        this.setUpNumeralLocale();
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
        setUpNumeralLocale() {
            //locale recognition, rudimentary, from navigator.language if defined
            // webpack does not have locale support out of the box
            // but numeral locales are 8k compressed thus importing them all
            if (navigator.language){

                var locale = navigator.language.toLowerCase();

                numeral.locale(locale);

                // it might not exist as instead of "en-us"
                // numeral defines "en", live with this for now
                // change later to use navigators convention http://www.ietf.org/rfc/bcp/bcp47.txt
                if (!numeral.localeData()){
                    // try again with an abbreviated version
                    numeral.locale(locale.split( '-' )[0]);
                }

                if (!numeral.localeData()){
                    // set to english, browser might be set
                    // to a locale numeral does not have
                    numeral.locale("en-gb")
                }

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
    ])
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

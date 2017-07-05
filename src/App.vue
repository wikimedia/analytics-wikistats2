<template>
<div class="app">
    <section class="ui top attached clearing segment">
        <top-nav :wikiCode="wiki"></top-nav>
    </section>
    <section class="ui attached content segment">
        <topic-explorer></topic-explorer>

        <router-view></router-view>
    </section>
    <section class="ui attached language segment">
        <site-language></site-language>
    </section>
    <section class="ui attached footer segment">
        <bottom-footer></bottom-footer>
    </section>
</div>
</template>

<script>
import TopNav from './components/TopNav'
import TopicExplorer from './components/TopicExplorer'
import SiteLanguage from './components/SiteLanguage'
import BottomFooter from './components/BottomFooter'

import router from './router';

export default {
    name: 'app',
    components: {
        TopNav,
        TopicExplorer,
        SiteLanguage,
        BottomFooter,
    },
    data () {
        return {
            wiki: ''
        }
    },
    updated () {
        this.setStateFromURL();
    },
    mounted () {
        this.setStateFromURL();
    },
    methods: {
        setStateFromURL () {
            this.$store.state.project = this.$route.params.wikiCode;
            this.$store.state.area = this.$route.params.area;
            this.$store.state.metric = this.$route.params.metric;
        }
    },
    watch: {
        // '$store.getters.projectCode': function () {
        //     router.push('/' + this.$store.state.project)
        // },
        // '$store.getters.area': function () {
        //     if (!this.$store.getters.area) return
        //     router.push('/' + this.$store.state.project + '/' + this.$store.state.area + '/' + this.$store.state.metric)
        // },
        // '$store.getters.metric': function () {
        //     if (!this.$store.getters.metric) return
        //     router.push('/' + this.$store.state.project + '/' + this.$store.state.area + '/' + this.$store.state.metric)
        // },
        '$store.getters': {
            handler: function () {
                this.wiki = this.$store.state.project;
                if (this.$store.getters.area) {
                    if (this.$store.getters.metric) {
                        router.push('/' + this.$store.state.project + '/' + this.$store.state.area + '/' + this.$store.state.metric)
                    } else {
                        router.push('/' + this.$store.state.project + '/' + this.$store.state.area)
                    }
                } else {
                    router.push('/' + this.$store.state.project)
                }
            },
            deep: true
        }
    }
}
</script>

<style>
a { color: #6289D8; }
a:visited { color: #6289D8; }
a.router-link-active { color: #5C5C5C; }
a { font-weight: normal; color: #3366cc; }
a.router-link-active { font-weight: bold; color: #72777d }
.ui.dropdown { background-color: #fff; }
.ui.dropdown:hover { background-color: #fff; }

.ui.top.attached.clearing.segment {
    border-bottom: 4px solid #4A4A4A;
    padding: 35px 44px;
}
.ui.attached.content.segment {
    background-color: #F6F6F6;
    padding: 53px 32px 27px 32px;
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

<template>
<div class="slide transition animateable container" :class="{down: !topicsMinimized}">
    <div @click="minimizeTopics(false)">
        <span class="xui grey corner button">
            <i class="ui info circle icon"/>
            <span>Explore topics</span>
            <i class="ui chevron down icon"/>
        </span>
    </div>
    <div class="ui grey inverted segment animateable topic searcher" :class="{down: !topicsMinimized}">
        <span v-if="!topicsMinimized" class="xui link" @click="minimizeTopics(true)">
            <i class="ui info circle icon"/>
            <span>Explore topics</span>
            <i class="ui up chevron icon"/>
        </span>
        <div class="ui search">
            <div class="ui icon input">
                <label hidden for="searchDisplay">Search or Browse questions and pick one to see answers</label>
                <input class="prompt" type="search" v-model="searchDisplay"
                    placeholder="Search or Browse questions and pick one to see answers"
                    @blur="onBlur"
                    @keyup.enter="select"
                    @focus="open"
                    @keyup.esc="close"
                    @keydown.down="changeHighlight(1)"
                    @keydown.up="changeHighlight(-1)"
                    @click="clear"/>
                <i class="search icon"></i>
            </div>
            <search-results v-if="showResults"
                ref="searchResults"
                :data="searchData" :search="searchDisplay"
                title="question"
                subtitle="metric"
                @select="found"></search-results>
        </div>

        <!--div class="ui blue button" @click="go">Go</div-->
        <span class="xui right floated link" @click="minimizeTopics(true)">
            <i class="ui up chevron icon"/>
        </span>
    </div>
</div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import _ from '../lodash-custom-bundle';
import config from '../config'
import SearchResults from './widgets/SearchResults';


export default {
    name: 'topic-explorer',
    components: {
        SearchResults,
    },

    data () {
        return {
            selectedTopic: null,
            searchBoxEl: null,
            searchData: [],
            searchDisplay: '',
            showResults: false,
        };
    },

    mounted () {
        this.searchData = config.questions;
    },

    computed: mapState([
        'topicsMinimized',
    ]),

    methods: {
        selectQuestion (q) {
            this.selectedQuestion = q;
        },

        go () {
            const t = this.selectedTopic;
            this.$store.commit('metric', { area: t.area, metric: _.kebabCase(t.metric) });
        },

        select () {
            if (this.$refs.searchResults) {
                this.$refs.searchResults.selectHighlighted();
            }
        },
        close () {
            this.showResults = false;
        },
        open () {
            this.showResults = true;
        },
        clear () {
            this.searchDisplay = '';
        },
        onBlur () {
            if (this.$refs.searchResults && !this.$refs.searchResults.mouseHover) {
                this.close();
            }
        },
        changeHighlight (indexDiff) {
            if (this.$refs.searchResults) {
                this.$refs.searchResults.changeHighlight(indexDiff);
            }
        },
        found (topic) {
            this.selectedTopic = topic;
            this.searchDisplay = topic.question;
            this.go();
            this.close();
        },
        minimizeTopics (minimize) {
            this.$store.commit('topicExplorer', { minimize });
        },
    },
}
</script>

<style scoped>
.animateable {
    transition: all 0.4s;
}
.slide.transition.container {
    position: relative;
    height: 43px;
    margin: -2px -32px 0 -24px;
}
.slide.transition.animateable.container.down {
    height: 87px;
}
.slide.transition.container > div {
    position: absolute;
}
.animateable.topic.searcher {
    top: -84px;
}
.animateable.topic.searcher.down {
    top: 0;
}

.xui.grey.corner.button,
.ui.grey.inverted.segment {
    background-color: #72777d !important;
}
.xui.corner.button {
    display: inline-block;
    text-align: center !important;
    line-height: 40px;
    margin: 0;
    width: 163px;
    height: 40px;
    border-radius: 0 0 2px 0;
    background-color: #72777d;
    cursor: pointer;
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    font-weight: 900;
    text-align: left;
    color: #fff;
}
.xui.link {
    cursor: pointer;
}
.ui.inverted.segment {
    width: 100%;
    height: 84px;
    padding: 20px 30px;
    margin: 0;
    border-radius: 0;
    font-size: 16px;
    font-weight: 900;
    color: #fff;
}

.ui.search .ui.input ::-webkit-input-placeholder {
    color: #54595d;
}

.ui.search .ui.input ::-ms-input-placeholder {
    color: #54595d;
}

.ui.search .ui.input ::-moz-placeholder {
    color: #54595d;
    opacity: 1;
}

.ui.search {
    display: inline-block;
    width: 79%;
    margin-left: 10px;
    margin-right: 6px;
}
.ui.search .ui.input {
    width: 100%;
}
.ui.inverted.segment .ui.search .ui.input input {
    height: 35px;
    border-radius: 2px;
}

.dropdown.button {
    width: 70%;
    margin-left: 10px;
}
.ui.blue.button {
    background-color: #36c !important;
    width: 78px;
}

@media ( max-width: 450px ) {
    .xui.grey.corner.button {
        width: 100vw;
        margin-left: -1px;
        border-radius: 0;
    }
    .slide.transition.container {
        margin: 0;
    }
    .xui.link {
        margin: 0;
        padding: 0;
    }
}

@media ( max-width: 1000px ) {
  .ui.segment.topic.searcher {
        padding: 10px;
    }
    .xui.link {
        display: inline-block;
        margin-bottom: 10px;
    }
    .topic.searcher .ui.search {
        width: 97%;
    }
}
</style>

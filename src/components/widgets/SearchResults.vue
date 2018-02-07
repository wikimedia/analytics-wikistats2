<template>
<div>
    <ul class="search results"
        @mouseenter="setMouseHover(true)"
        @mouseleave="setMouseHover(false)">
        <li v-for="r in displayedResults"
            @mouseenter="highlightResult(r)"
            @click="select(r)"
            :class="{ highlighted: highlightedResult === r }">

            <span>{{r[title || 'title']}}</span>
            <span class="subtitle" v-if="subtitle && r[title] !== r[subtitle]">
                {{r[subtitle]}}
            </span>
        </li>
    </ul>
</div>
</template>

<script>
import _ from '../../lodash-custom-bundle';
import Vue from 'vue';


function makeRegex (s) {
    return new RegExp(s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
}

// Determins whether a result matches the searched text and how much.
// The factor is composed of 1) how soon the searched text appears
// in the result, and 2) which percentage of the result's text matches
// the searched text.
function searchInfo (haystack, needle, regexp) {
    const max = 9007199254740992; // JS largest number
    const matches = regexp.test(haystack);
    const index = matches ? haystack.search(regexp) : max;
    const percentMatch = matches ? needle.length / haystack.length : 0;
    const factor = index - percentMatch;
    return [matches, factor];
}

const defaultMaxResults = 50;

export default {
    name: 'search-results',

    data () {
        return {
            // Whether the mouse is hovering over the search results box.
            mouseHover: false,

            // The result that is highlighted at the moment.
            highlightedResult: null,

            // The search results DOM element.
            container: null,

            displayedResults: [],

            maxResults: defaultMaxResults
        };
    },

    props: {
        // the string to search for
        search: String,

        // items to search through, must be objects x with x[title] defined
        data: Array,

        // (title) the field of each object in data to use as the main display string
        title: String,

        // (optional) (null) the field of each object in data to use as the secondary display string
        subtitle: { type: String, required: false }
    },

    mounted () {
        this.container = $('.search.results', this.$el);
        this.initializeDisplayedResults();
    },

    updated () {
        // Code at this level executes at the start of each component update.

        Vue.nextTick(() => {
            // Code at this level executes after the full component has been re-rendered.

            if (this.maxResults < this.fullResults.length) {

                // This timeout greatly improves time to first render of search results.
                // It seems that Vue.nextTick() does not return control to the browser
                // until all search data has been added to the displayed results. Thus,
                // defeating the purpose of the optimization.
                setTimeout(this.extendDisplayedResults, 0);
            }
        });
    },

    methods: {
        setMouseHover (value) {
            this.mouseHover = value;
        },

        highlightResult (result) {
            if (result) {
                this.highlightedResult = result;
                Vue.nextTick(this.scrollToFitHighlight);
            }
        },

        scrollToFitHighlight () {
            // Tries to maintain the highlighted element within the search results box.
            const highlightedElement = $('.highlighted', this.container);
            const containerHeight = this.container.height();
            const currentScroll = this.container.scrollTop();
            const elementTop = highlightedElement.position().top;
            const elementBottom = elementTop + highlightedElement[0].clientHeight;
            if (elementTop < 0) {
                // The highlighted result is over the top of the box.
                this.container.scrollTop(currentScroll + elementTop);
            } else if (elementBottom > containerHeight) {
                // the highlighted result is under the bottom of the box.
                this.container.scrollTop(currentScroll + elementBottom - containerHeight);
            }
        },

        select (result) {
            this.$emit('select', result);
        },

        selectHighlighted () {
            if (this.highlightedResult) {
                this.select(this.highlightedResult);
            }
        },

        changeHighlight (indexDiff) {
            let index = this.displayedResults.findIndex(r => r === this.highlightedResult);
            index = Math.max(
                Math.min(
                    index + indexDiff,
                    this.maxResults - 1,
                    this.displayedResults.length - 1
                ),
                0
            );
            this.highlightResult(this.displayedResults[index]);
        },

        initializeDisplayedResults () {
            this.maxResults = defaultMaxResults;
            this.displayedResults = _.take(this.fullResults, this.maxResults);
            this.container.scrollTop(0);
            this.highlightResult(this.displayedResults[0]);
        },

        extendDisplayedResults () {
            this.maxResults = this.maxResults + defaultMaxResults;
            const newSlice = this.fullResults.slice(this.displayedResults.length, this.maxResults);
            this.displayedResults.push(...newSlice);
        }
    },

    watch: {
        fullResults: function () {
            this.initializeDisplayedResults();
        }
    },

    computed: {
        fullResults: function () {
            const {
                search,
                data = [],
                title,
                subtitle
            } = this.$props;

            if (!search) { return data; }
            const s = makeRegex(search);

            return _.sortBy(
                _.filter(
                    _.map(
                        data,
                        d => {
                            const [titleMatches, titleFactor] = searchInfo(d[title], search, s);
                            const [subtitleMatches, subtitleFactor] = searchInfo(d[subtitle], search, s);
                            return Object.assign({
                                matches: titleMatches || subtitleMatches,
                                factor: Math.min(titleFactor, subtitleFactor)
                            }, d);
                        }
                    ),
                    d => d.matches
                ),
                d => d.factor
            );
        }
    }
}
</script>

<style>
ul.search.results {
    z-index: 1;
    position: absolute;
    list-style: none;
    background-color: #ffffff;
    color: #1b1c1d;
    font-size: 18px;

    padding: 0;
    margin-top: 8px;

    width: 100%;
    height: 212px;
    max-height: 400px;
    overflow-y: auto;

    border: solid 1px #dededf;
}

ul.search.results li {
    padding: 6px 14px;
}
ul.search.results li:first-child {
    padding-top: 12px;
}
ul.search.results li:last-child {
    padding-bottom: 12px;
}

ul.search.results li.highlighted {
    background-color: #ffe1ee;
    cursor: pointer;
}

ul.search.results span.subtitle {
    font-size: 14px;
    color: #555;
}
</style>

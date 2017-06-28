<template>
<div>
    <ul class="search results">
        <li v-for="r in results"
            @mouseenter="hover(r)"
            @click="select(r)"
            :class="{ hovering: hovering === r }">

            <span>{{r[title || 'title']}}</span>
            <span class="subtitle" v-if="subtitle">{{r[subtitle]}}</span>
        </li>
    </ul>
</div>
</template>

<script>
import _ from 'lodash'


function makeRegex (s) {
    return new RegExp(s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
}

export default {
    name: 'search-results',

    data () {
        return {
            hovering: null,
            container: null,
            index: 0,
        }
    },

    props: {
        // the string to search for
        search: String,

        // items to search through, must be objects x with x[title] defined
        data: Array,

        // (title) the field of each object in data to use as the main display string
        title: String,

        // (optional) (null) the field of each object in data to use as the secondary display string
        subtitle: { type: String, required: false },

        // (optional) (10) don't show more results than this
        maxResults: { type: Number, default: 10 },
    },

    mounted () {
        this.container = $('.search.results', this.$el);
    },

    methods: {
        hover (result, scroll) {
            if (result) {
                this.hovering = result;
                this.index = this.results.findIndex(r => r === result);

                _.debounce(() => {
                    let hovered = $('.hovering', this.container).position();
                    if (scroll && hovered) {

                        this.container.scrollTop(this.container.scrollTop() + hovered.top);
                    }
                })();
            }
        },
        select (result) {
            this.$emit('select', result);
        },
        selectHighlighted () {
            if (this.hovering) {
                this.select(this.hovering);
            }
        },
        changeHighlight (indexDiff) {
            this.index = Math.max(Math.min(this.index + indexDiff, this.$props.maxResults - 1), 0);
            this.hover(this.results[this.index], true);
        },
    },

    watch: {
        results: function () {
            this.hover(this.results[0], true);
        },
    },

    computed: {

        results: function () {
            const {
                search,
                data = [],
                title = 'title',
                subtitle,

            } = this.$props;

            if (!search) { return _.take(data, this.$props.maxResults); }
            const s = makeRegex(search);

            return _.take(
                _.filter(data, d => s.test(d[title]) || (subtitle && s.test(d[subtitle]))),
                this.$props.maxResults
            );
        },
    },
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

    border-radius: 4px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.14);
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

ul.search.results li.hovering {
    background-color: #ffe1ee;
    cursor: pointer;
}

ul.search.results span.subtitle {
    font-size: 14px;
    color: #555;
}
</style>

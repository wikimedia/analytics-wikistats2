<template>
<div>
    <div class="ui search">
        <div class="ui icon input">
            <input class="prompt" type="text" v-model="searchDisplay"
                :placeholder="single ? 'Choose a Wiki' : 'Add another Wiki'"

                @keyup.enter="select"
                @keyup.esc="close"
                @keydown.down="changeHighlight(1)"
                @keydown.up="changeHighlight(-1)"/>

            <i class="search icon"></i>
        </div>
        <search-results v-if="showResults"
            ref="searchResults"
            :data="searchData" :search="search"
            subtitle="description"
            @select="found"></search-results>
    </div>
    <div v-if="!single">
        <a @click.prevent="addAnotherWiki" href="#">Add another Wiki</a>
        <div class="add wiki design">
            "Add another Wiki" is not implemented in the prototype.  But you can see how it would work in <a target="_new" href="https://www.dropbox.com/sh/lfrn4lcjyqhou7o/AAAmzec_63b1UwaZCGFDw1gea?dl=0&preview=Detail+Page+Two+Wiki+comparison.png">the design here</a> and <a href="https://www.dropbox.com/sh/lfrn4lcjyqhou7o/AAAmzec_63b1UwaZCGFDw1gea?dl=0&preview=Wiki+Selector.png" target="_new">here</a>.
        </div>
    </div>
</div>
</template>

<script>
import sitematrix from '../apis/Sitematrix';
import SearchResults from './widgets/SearchResults';


const modes = {
    family: 'Search through project families',
    language: 'Select a language',
};
const separator = ' – ';


export default {
    name: 'wiki-selector',
    props: {single: { type: Boolean, default: true }},

    data () {
        return {
            searchBoxEl: null,
            byFamily: [],
            searchData: [],

            // searchDisplay is what's seen in the text input
            // result is the computed part of searchDisplay that's already set
            // search is the computed string that's passed to search-results
            searchDisplay: '',
            family: null,
            language: null,

            mode: modes.family,
            showResults: false,
        }
    },

    components: {
        SearchResults,
    },

    mounted () {
        this.searchBoxEl = $('input.prompt', this.$el);

        sitematrix.getByProjectFamily().then(byFamily => {
            this.byFamily = byFamily;
            this.searchData = byFamily;
        })
    },

    watch: {
        searchDisplay: function () {
            if (this.language && !_.endsWith(this.searchDisplay, this.language.title)) {
                this.language = null;
            }
            if (this.family && !_.startsWith(this.searchDisplay, this.result)) {
                this.family = null;
                this.mode = modes.family;
                this.searchData = this.byFamily;
                this.searchDisplay = _.trim(this.searchDisplay, separator);
            }
            if (!this.language) {
                this.open();

            // if both family and language are selected, broadcast the choice
            } else if (this.family && this.language) {
                const { family, language } = this;
                this.$emit('wikiSelected', { family, language });
            }
        }
    },

    computed: {
        search () {
            return _.replace(this.searchDisplay, this.result, '');
        },
        result () {
            return this.family ? `${this.family.title}${separator}` : '';
        },
    },

    methods: {
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
        changeHighlight (indexDiff) {
            if (this.$refs.searchResults) {
                this.$refs.searchResults.changeHighlight(indexDiff);
            }
        },
        found (wiki) {
            if (this.mode === modes.family) {
                this.family = wiki;
                this.mode = modes.language;
                this.searchDisplay = this.result;
                this.searchData = wiki.projects;
                // if  there's only one sub-project, just select it
                if (this.searchData.length === 1) {
                    this.found(this.searchData[0]);
                }

            } else if (this.mode === modes.language) {
                this.language = wiki;
                this.searchDisplay = this.result + this.language.title;
                this.close();
            }
            this.searchBoxEl.focus();
        }
    },
}
</script>

<style>
.ui.search.focus .ui.input input {
    background-color: #c0c1c2;
    border-color: #979797;
}
.ui.search.focus .ui.input input::placeholder {
    color: #dfdfdf;
}
</style>

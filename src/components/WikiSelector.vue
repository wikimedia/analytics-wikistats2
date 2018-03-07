<template>
<div>
    <div class="ui search">
        <div class="ui icon input">
            <input class="prompt" type="text" v-model="inputText"
                ref="inputBox"
                :placeholder="placeholder"
                @click="open"
                @keydown.up="navigateSearchResults(-1)"
                @keydown.down="navigateSearchResults(1)"
                @keyup.enter="selectSearchResult"
                @blur="blur"
                @keyup.esc="close"
                @mouseover="animateLongTextRight"
                @mouseleave="animateLongTextLeft"/>
            <i class="search icon"></i>
        </div>
        <search-results v-if="showSearchResults"
            ref="searchResults"
            title="title"
            subtitle="subtitle"
            :data="searchData"
            :search="searchText"
            @select="applySearchResult"></search-results>
    </div>
</div>
</template>

<script>
import sitematrix from '../apis/sitematrix';
import SearchResults from './widgets/SearchResults';
import _ from '../lodash-custom-bundle';

const separator = ' – ';

// When there is a wiki already specified in the state,
// the wikiselector has to wait for the sitematrix
// to be loaded before showing the project family and language.
// Until then the loading placeholder will be shown.
// After that, the regular typing placeholder will be shown.
const placeholders = {
    loading: 'Loading...',
    typing: 'Type and choose a wiki...'
};

// Format object used as a parameter for the sitematrix API.
// It will format the API responses to act like search results.
const searchDataFormat = {
    type: true,
    code: true,
    title: 'localName',
    subtitle: 'name'
};

export default {
    name: 'wiki-selector',

    data () {
        return {
            inputText: '',
            showSearchResults: false,
            sitematrixData: null,
            searchData: [],
            projectFamily: null,
            language: null
        };
    },

    components: {
        SearchResults
    },

    mounted () {
        this.initWithCurrentWiki();
        this.initTextWidthMeasurer();
    },

    watch: {
        '$store.getters.mainState' () {
            this.initWithCurrentWiki();
        },

        inputText () {
            // Help deleting the separator with a single keystroke.
            if (!this.inputText.includes(separator) && (this.projectFamily || this.language)) {
                this.projectFamily = null;
                this.language = null;
                this.inputText = this.inputText.replace(separator.slice(0, -1), '');
            }
        },

        projectFamily () {
            this.updateSearchData();
        },

        language () {
            this.updateSearchData();
        }
    },

    computed: {
        searchText () {
            if (this.inputText.includes(separator)) {
                return this.inputText.split(separator)[1].trim();
            } else {
                return this.inputText.trim();
            }
        },
        placeholder () {
            if (this.inputText === '') {
                if (!this.showSearchResults){
                    return placeholders.loading;
                } else {
                    return placeholders.typing;
                }
            }
            return '';
        }
    },

    methods: {
        initWithCurrentWiki () {
            // Initialize the input text from the state project.
            const stateProject = this.$store.state.project;
            sitematrix.getWikiOrGroupFromHostname(stateProject).then(wikiInfo => {
                if (wikiInfo) {
                    if (wikiInfo.type === 'wikiGroup') {
                        this.inputText = wikiInfo.localName;
                    } else if (wikiInfo.type === 'specialWiki') {
                        this.inputText = wikiInfo.name;
                    } else { // regularWiki
                        this.inputText = (
                            wikiInfo.projectFamily.localName +
                            separator +
                            wikiInfo.language.localName
                        );
                    }
                } else {
                    this.inputText = 'INVALID: ' + stateProject;
                }
            });
        },

        initTextWidthMeasurer () {
            // Create a hidden div for measuring the input text.
            if (!$('#wikiselector-hidden-measurer').length) {
                let div = document.createElement('div');
                div.setAttribute('id', 'wikiselector-hidden-measurer');
                document.body.appendChild(div);
            }
        },

        animateLongTextRight () {
            // Measures input text.
            const input = $(this.$refs.inputBox);
            const inputPadding = (
                parseFloat(input.css('padding-left')) +
                parseFloat(input.css('padding-right'))
            );
            const inputBorder = parseFloat(input.css('border-width')) * 2;
            const inputWidth = input.width() - inputPadding - inputBorder;
            const measurer = $('#wikiselector-hidden-measurer');
            measurer.css('font-size', input.css('font-size'));
            measurer.html(input.val());

            // Triggers animation if necessary.
            if (inputWidth < measurer.width() && !input.is(':focus')) {
                const offset = inputWidth - measurer.width();
                input.animate({textIndent: offset}, 500);
            }
        },

        animateLongTextLeft () {
            $(this.$refs.inputBox).stop().animate({textIndent: 0}, 200);
        },

        stopLongTextAnimation () {
            $(this.$refs.inputBox).stop().css('text-indent', 0);
        },

        open () {
            // Open is called when the user clicks on the WikiSelector.
            // If the WikiSelector is already open when receiving the click,
            // this method shouldn't do anything.
            if (!this.showSearchResults) {
                this.stopLongTextAnimation();
                this.inputText = '';
                this.showSearchResults = true;
                this.updateSearchData();
            }
        },

        blur () {
            // Do not close, if the blur click was made on the search results.
            if (!this.$refs.searchResults.mouseHover) {
                this.close();
            }
        },

        close () {
            $(this.$refs.inputBox).blur();
            this.showSearchResults = false;
            this.projectFamily = null;
            this.language = null;
            this.initWithCurrentWiki();
            this.updateSearchData();
        },

        updateSearchData () {
            if (this.showSearchResults) {
                let dataPromise;

                if (this.projectFamily && !this.language) {
                    // Project family is already chosen.
                    dataPromise = sitematrix.getLanguages(this.projectFamily.code, searchDataFormat);
                } else if (this.language && !this.projectFamily) {
                    // Language is already chosen.
                    dataPromise = sitematrix.getProjectFamilies(this.language.code, searchDataFormat);
                } else if (!this.projectFamily && !this.language) {
                    // Neither project family nor language are chosen yet.
                    dataPromise = this.getAllSearchData();
                } else {
                    dataPromise = Promise.resolve([]);
                }
                dataPromise.then(data => {
                    this.searchData = data;
                });
            } else {
                this.searchData = [];
            }
        },

        getAllSearchData () {
            // No need to go through all the promise parsing code more than once.
            // This saves about ~10 ms of execution time (profiled with console.time).
            // We probably we can benefit from this pattern of locally caching data
            // rather that re-resolve the chain of promises elsewhere.

            if (this.sitematrixData){
                return Promise.resolve(this.sitematrixData);
            }  else {

                return Promise.all([
                    sitematrix.getWikiGroups(searchDataFormat),
                    sitematrix.getProjectFamilies(null, searchDataFormat),
                    sitematrix.getLanguages(null, searchDataFormat),
                    sitematrix.getSpecialWikis({
                        type: true,
                        code: 'hostname',
                        title: 'name',
                        subtitle: 'hostname'
                    }),
                    sitematrix.getRegularWikis({
                        type: true,
                        code: 'hostname',
                        title: 'hostname',
                        subtitle: 'dbname'
                    })

                ]).then(values => {
                    const [groups, projectFamilies, languages, specials, wikis] = values;

                    this.sitematrixData = _.concat(groups, projectFamilies, languages, specials, wikis);
                    return this.sitematrixData;
                });
            }
        },

        navigateSearchResults (offset) {
            if (this.$refs.searchResults) {
                this.$refs.searchResults.changeHighlight(offset);
            }
        },

        selectSearchResult () {
            if (this.$refs.searchResults) {
                this.$refs.searchResults.selectHighlighted();
            }
        },

        applySearchResult (result) {
            if (result.type === 'projectFamily') {
                this.projectFamily = result;
                if (this.language) {
                    // If language was already chosen, commit the new state.
                    this.commitProjectFamilyAndLanguage(this.projectFamily, this.language);
                } else {
                    // Otherwise, just update the input text.
                    this.inputText = this.projectFamily.title + separator;
                    $(this.$refs.inputBox).focus();
                }
            } else if (result.type === 'language') {
                this.language = result;
                if (this.projectFamily) {
                    // If project family was already chosen, commit the new state.
                    this.commitProjectFamilyAndLanguage(this.projectFamily, this.language);
                } else {
                    // Otherwise, just update the input text.
                    this.inputText = this.language.title + separator;
                    $(this.$refs.inputBox).focus();
                }
            } else { // wikiGroup, specialWiki or regularWiki
                this.commitProject(result.code);
            }
        },

        commitProjectFamilyAndLanguage (projectFamily, language) {
            sitematrix.getRegularWikiFromProjectFamilyAndLanguage(
                projectFamily.code,
                language.code
            ).then(wiki => {
                this.commitProject(wiki.hostname);
            });
        },

        commitProject (project) {
            this.$store.commit('setState', {project});
            this.close();
        }
    }
};
</script>

<style>
.ui.search.focus .ui.input input {
    background-color: #c0c1c2;
    border-color: #979797;
}
.ui.search.focus .ui.input input::placeholder {
    color: #dfdfdf;
}
#wikiselector-hidden-measurer {
    visibility: hidden;
    position: absolute;
    z-index: -1;
}

@media(max-width: 450px) {
    .widgets .ui.input > input {
        width: 91vw!important;
        margin-left: 1em;
    }
}
</style>

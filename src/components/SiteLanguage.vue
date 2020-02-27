<template>
<section>
    <i class="ui globe icon"/>
    Choose your preferred language
    <div v-if="languages" class="ui simple dropdown right labeled icon button">
        <span>{{selectedLanguageTitle}}</span>
        <div class="menu">
            <div @click="selectLanguage(language)" v-for="language in selectableLanguages" class="item">
                <span>{{language.localizedLanguage}}</span>
                <span class="subdued">{{language.nativeLanguage}}</span>
            </div>
        </div>
        <i class="ui dropdown icon"/>
    </div>
    <div v-else class="ui simple dropdown right labeled icon button">
        <span>Loading...</span>
    </div>
</section>
</template>

<script>
import sitematrix from 'Src/apis/sitematrix';
export default {
    name: 'site-language',
    props: ['availableLanguages'],
    data () {
        return {
            languages: null,
            selectedLanguage: window.localStorage.getItem('language') || 'en'
        }
    },
    computed: {
        selectableLanguages() {

            return this.languages
                .filter(l => this.availableLanguages.includes(l.code) && l.code !== this.selectedLanguage)
                .map(l => ({
                    localizedLanguage: l.localName,
                    nativeLanguage: l.name,
                    code: l.code
                }));
        },
        selectedLanguageTitle () {
            return this.languages.find(lang => lang.code === this.selectedLanguage).localName;
        }
    },
    mounted () {
        sitematrix.getLanguages().then(languages => this.languages = languages);
    },
    methods: {
        selectLanguage(language) {
            const languageCode = language.code
            this.selectedLanguage = languageCode;
            window.localStorage.setItem('language', languageCode);
            location.reload();
        }
    }
}
</script>

<style scoped>
.ui.dropdown { margin-left: 10px; }
section {
    color: #fff;
    font-size: 12px;
}
.alreadySelected {
    cursor: default;
}
</style>

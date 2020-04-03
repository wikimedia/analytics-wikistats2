<template>
<section>
    <i class="ui globe icon"/>
    Choose your preferred language
    <div v-if="languages" class="ui simple dropdown right labeled icon button">
        <span>{{selectedLanguageTitle}}</span>
        <div class="menu">
            <div @click="selectLanguage(language)" v-for="language in languages" class="item">
                <span>{{language.nativeName}}</span>
                <span class="subdued">{{language.englishName}}</span>
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
import languageMap from 'Src/languages.json';
const availableLanguages = Object.keys(languageMap)
    .map(key => Object.assign(languageMap[key], {code: key}))
    .sort((a, b) => a.nativeName.localeCompare(b.nativeName));

export default {
    name: 'site-language',
    data () {
        return {
            languages: availableLanguages,
            selectedLanguage: window.localStorage.getItem('language') || 'en'
        }
    },
    computed: {
        selectedLanguageTitle () {
            return this.languages.find(lang => lang.code === this.selectedLanguage).nativeName;
        }
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

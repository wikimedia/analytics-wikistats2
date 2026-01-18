<template>
<section>
    <i class="ui globe icon"/>
    {{$t('general-choose-language')}}
    <div v-if="languages" class="ui floating dropdown button"  @click = "toggleVisibility()">
        <span>{{selectedLanguageTitle}}</span>
        <div class="menu" v-bind:class="{shown: visible, hidden: !visible}">
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
            visible: false,
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
        },
        toggleVisibility (){
            this.visible = !this.visible;
        },
    }
}
</script>

<style scoped>
.ui.dropdown {
    margin-left: 10px;
    background-color: #fff;
}
section {
    color: #fff;
    font-size: 12px;
}
.alreadySelected {
    cursor: default;
}
.menu.hidden {
    display: none;
}
.menu.shown {
    display: block!important;
    opacity: 1;
    animation-name: fadeInOpacity;
    animation-duration: 0.3s;
    max-height: 70vh;
    overflow: scroll;
    overflow-x: hidden;
}
</style>

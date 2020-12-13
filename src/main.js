// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import numbro from 'numbro';
import numbroLocales from '../node_modules/numbro/dist/languages.min.js'
import languageMap from 'Src/languages.json';
import englishMessages from 'Src/i18n/en.json';
import '../semantic/dist/semantic.css';
import './lato/lato.css';

import store from './store';
import router from './router';
import {routes} from './router/routes';

import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

import './filters';
import './directives';

Vue.config.productionTip = false;
const localeContainer = {};

/*
  userMessages is a global variable
  set by webpack before the vue app is started.
  The logic for language detection is at src/index.ejs
*/
const globalLocale = window.localStorage.getItem('language') || 'en';
localeContainer[globalLocale] = userMessages;
localeContainer['en'] = englishMessages;
const i18n = new VueI18n({
  locale: globalLocale,
  messages: localeContainer,
  fallbackLocale: 'en'
});
setUpNumbroLocale(globalLocale, numbroLocales, languageMap);
initVueApp(i18n);


function setUpNumbroLocale(locale, numbroLocales, languageMap) {

  const numbroCode = languageMap[locale]['numbroCode'];

  if (!numbroCode || numbroCode =='en'){
    return;
  }

  numbro.registerLanguage(numbroLocales[numbroCode])
  numbro.setLanguage(numbroCode);
}

function initVueApp (i18n) {
  // eslint-disable no-new
  new Vue({
      el: '#wikistats-app',
      store,
      i18n,
      template: '<App/>',
      components: { App },
      mounted () {
          new router.Router(store, routes);
      },
  });
}

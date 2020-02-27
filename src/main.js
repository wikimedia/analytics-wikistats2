// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import Vue from 'vue';
import App from './App';
import numeral from 'numeral';
import * as locales from 'numeral/locales';
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
setUpNumeralLocale(globalLocale);
initVueApp(i18n);


function setUpNumeralLocale(locale) {
  numeral.locale(locale);

  // it might not exist as instead of "en-us"
  // numeral defines "en", live with this for now
  // change later to use navigators convention http://www.ietf.org/rfc/bcp/bcp47.txt
  if (!numeral.localeData()){
      // try again with an abbreviated version
      numeral.locale(locale.split( '-' )[0]);
  }

  if (!numeral.localeData()){
    // set to english, browser might be set
    // to a locale numeral does not have
    numeral.locale("en-gb")
  }
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

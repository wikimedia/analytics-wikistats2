// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import Vue from 'vue';
import App from './App';
import '../semantic/dist/semantic.css';
import './lato/lato.css';

import store from './store';
import router from './router';
import {routes} from './router/routes';

import './filters';
import './directives';

Vue.config.productionTip = false;


// eslint-disable no-new
new Vue({
    el: '#wikistats-app',
    store,
    template: '<App/>',
    components: { App },
    mounted () {
        new router.Router(store, routes);
    },
});

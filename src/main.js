// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import Vue from 'vue';
import App from './App';
import '../semantic/dist/semantic.css';
import './lato/lato.css';

import store from './store';
import router from './router';
import routes from './router/routes';
import numeral from 'numeral';
import dateformat from 'dateformat';

Vue.config.productionTip = false;

const thousands = n => numeral(n).format('0,0');
const kmb = n => numeral(n).format('0,0a')
const filterRange = (filter, str) => {
    return filter(parseInt(str.split('-')[0])).toUpperCase() + '→' + filter(parseInt(str.split('-')[1])).toUpperCase();
};
// Register filters
Vue.filter('thousands', (n) => {
    if (typeof n === 'string' && n.indexOf('-') > -1) {
        return filterRange(thousands, n);
    } else return thousands(n);
});
Vue.filter('kmb', (n) => {
    if (typeof n === 'string' && n.indexOf('-') > -1) {
        return filterRange(kmb, n);
    } else return kmb(n);
});
Vue.filter('date', (date) => dateformat(date, 'yyyy-mm-dd'));
Vue.filter('elipsis', (n, l) => n.substring(0, l) + (l <= n.length ? '...' : ''));

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

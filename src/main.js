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

// we might need to move away from dateformat and use moment.js
// when we do localization
import dateformat from 'dateformat';

Vue.config.productionTip = false;

// use locale-driven formatting for thousands
const thousands = n => numeral(n).format('');
const kmb = (n) => {
    let units = numeral(n).format('0[.]0[0]a');
    return units.toUpperCase();
}
const bytes = n => numeral(n).format('0[.]0[0] b');
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
        return filterRange(kmb, n).toUpperCase();
    } else return kmb(n);
});
Vue.filter('bytes', (n) => bytes(n) );
Vue.filter('ISOdateUTC', (date, format) => dateformat(date, format || 'yyyy-mm-dd', true));
Vue.filter('elipsis', (n, l) => n.substring(0, l) + (l <= n.length ? '...' : ''));
Vue.filter('capitalize', (str) => str.charAt(0).toLocaleUpperCase() + str.slice(1));

// months is an array of strings that would need to be localized
Vue.filter('getMonthLabel', (date, months, abbridged) => {
    if (abbridged) {
        return months[date.getUTCMonth() + 1][0];
    } else {
       return months[date.getUTCMonth() + 1];
    }
})

Vue.filter('bytesOrKmb', (n , unit) => {
    if (unit === 'bytes') {
        return bytes(n);
    } else {
    	return kmb(n);
    }
 });

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

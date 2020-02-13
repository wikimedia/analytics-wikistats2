import Vue from 'vue';

// we might need to move away from dateformat and use moment.js
// when we do localization
import dateformat from 'dateformat';
import numeral from 'numeral';

// use locale-driven formatting for thousands
const thousands = n => numeral(n).format('');

// given 1234 will return "3"
function getNumberOfDigits(num){
     return parseInt(num).toString().length;
}


// Formats to 'Three significan digits'
const kmb = (n) => {
    if (n < 1000) {
        return n;
    }

    const r = getNumberOfDigits(n) % 3;

    const units = numeral(n).format(r === 1 && n % 1000 !== 0? '0.0a' :  '0a');

    return units.toUpperCase();
}
const bytes = n => {
    let f = '';
    if (n < 0) f = '-';

    n = Math.abs(n);

    if (n < 1000) {
        return n;
    }

    var r = getNumberOfDigits(n) % 3;

    var units = numeral(n).format(r == 1 && n % 1000 !=0? "0.0b" : "0b");
    return f + units;
};
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
})


Vue.filter('monthShortName', (date)=> dateformat(date, 'mmm yyyy',true ));


import Vue from 'vue';

// we might need to move away from dateformat and use moment.js
// when we do localization
import dateformat from 'dateformat';
import numbro from 'numbro';

// use locale-driven formatting for thousands
const thousands = n => numbro(n).format({
    thousandSeparated: true
});

// Formats to 'Three significan digits'
const kmb = (n) => {

    const units = numbro(n).format({
        average: true,
        roundingFunction: x => x,
    });

    return units.toUpperCase();
}
const bytes = n => {

    const units = numbro(n).format({
        average: true,
        roundingFunction: x => x,
        output: 'byte',
        base: 'decimal',
    });

    return units;
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
    if (typeof n === 'string' && n.indexOf('-') > 0) {
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
    return unit === 'bytes' ? bytes(n) : kmb(n);
})

Vue.filter('monthShortName', (date)=> dateformat(date, 'mmm yyyy',true ));

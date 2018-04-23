import _ from '../lodash-custom-bundle';

const months = [
    null,
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const colors = {
    contributing: ['#C4CDDF', '#99AFD9', '#6582BA', '#2A4B8D'],
    reading: ['#C8F0E7', '#77D8C2', '#00AF89', '#03745C'],
    content: ['#FFF1C6', '#F9DF90', '#FFCC33', '#DDAD1C']
};

const qualitativeScale = {
    "1": [ "#7F3C8D" ],
    "2": [ "#7F3C8D", "#11A579", "#A5AA99" ],
    "3": [ "#7F3C8D", "#11A579", "#3969AC", "#A5AA99" ],
    "4": [ "#7F3C8D", "#11A579", "#3969AC", "#F2B701", "#A5AA99" ],
    "5": [ "#7F3C8D", "#11A579", "#3969AC", "#F2B701", "#E73F74", "#A5AA99" ],
    "6": [ "#7F3C8D", "#11A579", "#3969AC", "#F2B701", "#E73F74", "#80BA5A", "#A5AA99" ],
    "7": [ "#7F3C8D", "#11A579", "#3969AC", "#F2B701", "#E73F74", "#80BA5A", "#E68310", "#A5AA99" ],
    "8": [ "#7F3C8D", "#11A579", "#3969AC", "#F2B701", "#E73F74", "#80BA5A", "#E68310", "#008695", "#A5AA99" ],
    "9": [ "#7F3C8D", "#11A579", "#3969AC", "#F2B701", "#E73F74", "#80BA5A", "#E68310", "#008695", "#CF1C90", "#A5AA99" ],
    "10": [ "#7F3C8D", "#11A579", "#3969AC", "#F2B701", "#E73F74", "#80BA5A", "#E68310", "#008695", "#CF1C90", "#f97b72", "#A5AA99" ],
    "11": [ "#7F3C8D", "#11A579", "#3969AC", "#F2B701", "#E73F74", "#80BA5A", "#E68310", "#008695", "#CF1C90", "#f97b72", "#4b4b8f", "#A5AA99" ]
};

const buckets = [
    '100-999',
    '1000-9999',
    '10000-99999',
    '100000-999999',
    '1000000-9999999',
    '10000000-99999999',
    '100000000-999999999',
    '1000000000-9999999999'
]

const stableColorIndexes = {
    'Lightly Active': 0,
    'Active': 1,
    'Very Active': 2,
    'desktop': 0,
    'mobile-app': 1,
    'mobile-web': 2,
    'desktop-site': 0,
    'mobile-site': 1,
};

const lightColor = {
    contributing: colors.contributing[0],
    reading: colors.reading[0],
    content: colors.content[1]
};
const darkColor = {
    contributing: colors.contributing[3],
    reading: colors.reading[3],
    content: colors.content[3]
};


const areasWithMetrics = _.transform(questions, function (result, q) {
    let area = result.find((a) => a.name === q.a);
    if (!area) {
        area = {
            name: q.a,
            order: { contributing: 1, reading: 2, content: 3 }[q.a],
            color: colors[q.a][1],
            metrics: []
        };
        result.unshift(area);
    }

    area.metrics.push({
        name: _.kebabCase(q.m),
        fullName: q.m
    });

    result.sort((a, b) => a.order > b.order);
    return result;
}, []);

const mainMetricsByArea = [
    {
        state: {
            id: 'reading',
            name: 'Reading',
            metrics: [
                'total-page-views',
                'unique-devices',
                'page-views-by-country',
                'top-viewed-articles'
            ]
        }
    },
    /*{
        state: {
            id: 'contributing',
            name: 'Contributing',
            metrics: [
                'new-registered-users',
                'edits',
                'editors'
            ]
        }
    },
    {
        state: {
            id: 'content',
            name: 'Content',
            metrics: [
                'edited-pages',
                'net-bytes-difference',
                'absolute-bytes-diff'
            ]
        }
    }*/
];


const allMetrics = require('./metrics');
const metrics = {};

Object.keys(allMetrics).filter(k => !(allMetrics[k].disabled))
    .forEach(k => metrics[k] = allMetrics[k]);

const questions = Object.keys(metrics).map(k => ({
    id: k,
    metric: metrics[k].fullName,
    area: metrics[k].area,
    question: metrics[k].question,
})).sort((a, b) => a.area > b.area || a.metric > b.metric);

const AQS_HOST = 'https://wikimedia.org/api/rest_v1/metrics';

export default {

    ALL_PROJECTS: 'all-projects',

    sitematrix: {
        endpoint: 'https://meta.wikimedia.org/w/api.php?action=sitematrix&formatversion=2&format=json&maxage=3600&smaxage=3600'
    },

    aqs: {
        'total-page-views': {
            method: 'getAggregatedPageviews',
            endpoint: AQS_HOST + '/pageviews/aggregate/{{project}}/{{access}}/{{agent_type}}/{{granularity}}/{{start}}/{{end}}'
        },

        'unique-devices': {
            method: 'getUniqueDevices',
            endpoint: AQS_HOST + '/unique-devices/{{project}}/{{access-site}}/{{granularity}}/{{start}}/{{end}}'
        },

        'top-viewed-articles': {
            endpoint: AQS_HOST + '/pageviews/top/{{project}}/{{access}}/{{year}}/{{month}}/all-days'
        },

        'page-views-by-country': {
            endpoint: AQS_HOST + '/pageviews/top-by-country/{{project}}/{{access}}/{{year}}/{{month}}'
        },

        'new-pages': {
            endpoint: AQS_HOST + '/edited-pages/new/{{project}}/{{editor_type}}/{{page_type}}/{{granularity}}/{{start}}/{{end}}'
        },

        'new-registered-users': {
            endpoint: AQS_HOST + '/registered-users/new/{{project}}/{{granularity}}/{{start}}/{{end}}'
        },

        'editors': {
            endpoint: AQS_HOST + '/editors/aggregate/{{project}}/{{editor_type}}/{{page_type}}/{{activity_level}}/{{granularity}}/{{start}}/{{end}}'
        },

        'edits': {
            endpoint: AQS_HOST + '/edits/aggregate/{{project}}/{{editor_type}}/{{page_type}}/{{granularity}}/{{start}}/{{end}}'
        },

        'edited-pages': {
            endpoint: AQS_HOST + '/edited-pages/aggregate/{{project}}/{{editor_type}}/{{page_type}}/{{activity_level}}/{{granularity}}/{{start}}/{{end}}'
        },

        'net-bytes-difference': {
            endpoint: AQS_HOST + '/bytes-difference/net/aggregate/{{project}}/{{editor_type}}/{{page_type}}/{{granularity}}/{{start}}/{{end}}'
        },

        'absolute-bytes-diff': {
            endpoint: AQS_HOST + '/bytes-difference/absolute/aggregate/{{project}}/{{editor_type}}/{{page_type}}/{{granularity}}/{{start}}/{{end}}'
        }
    },

    // site config
    metricData (metricName) {
        return _.assign(
            metrics[metricName],
            { lightColor: lightColor[metrics[metricName].area] },
            { darkColor: darkColor[metrics[metricName].area] }
        );
    },

    getColorForBreakdown (breakdown, key, area) {
        return key === 'total' ?
            colors[area][colors[area].length - 1] :
            qualitativeScale[breakdown.values.length][breakdown.values.indexOf(breakdown.values.find(value => value.key === key))];
    },

    areas () {
        const areasFromMetrics = new Set();
        _.forEach(metrics, (metric) => {
            areasFromMetrics.add(metric.area);
        });
        const areaList = [
            { path: '', name: 'Dashboard' },
            { path: 'contributing', name: 'Contributing' },
            { path: 'reading', name: 'Reading' },
            { path: 'content', name: 'Content' },
        ].filter(
            (area) => area.path === '' || areasFromMetrics.has(area.path)
        );

        return areaList;
    },

    areaData () {
        return mainMetricsByArea;
    },

    metrics,
    colors,
    qualitativeScale,
    stableColorIndexes,
    questions,
    areasWithMetrics,
    months,
    buckets
};

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
    reading: ['#D1F2EB', '#76D7C4', '#48C9B0', '#17A589'],
    contributing: ['#D4E6F1', '#5499C7', '#2980B9', '#2471A3'],
    content: ['#FCF3CF', '#F9E79F', '#F4D03F', '#DDAD1C']
};

const qualitativeScale = {
    "1": [ "#CD6155" ],
    "2": [ "#CD6155", "#11A579", "#A5AA99" ],
    "3": [ "#CD6155", "#11A579", "#2471A3", "#A5AA99" ],
    "4": [ "#CD6155", "#11A579", "#2471A3", "#FBC02D", "#A5AA99" ],
    "5": [ "#CD6155", "#11A579", "#2471A3", "#FBC02D", "#E73F74", "#A5AA99" ],
    "6": [ "#CD6155", "#11A579", "#2471A3", "#FBC02D", "#E73F74", "#80BA5A", "#A5AA99" ],
    "7": [ "#CD6155", "#11A579", "#2471A3", "#FBC02D", "#E73F74", "#80BA5A", "#E68310", "#A5AA99" ],
    "8": [ "#CD6155", "#11A579", "#2471A3", "#FBC02D", "#E73F74", "#80BA5A", "#E68310", "#008695", "#A5AA99" ],
    "9": [ "#CD6155", "#11A579", "#2471A3", "#FBC02D", "#E73F74", "#80BA5A", "#E68310", "#008695", "#CF1C90", "#A5AA99" ],
    "10": [ "#CD6155", "#11A579", "#2471A3", "#FBC02D", "#E73F74", "#80BA5A", "#E68310", "#008695", "#CF1C90", "#f97b72", "#A5AA99" ],
    "11": [ "#CD6155", "#11A579", "#2471A3", "#FBC02D", "#E73F74", "#80BA5A", "#E68310", "#008695", "#CF1C90", "#f97b72", "#4b4b8f", "#A5AA99" ]
};

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
    reading: colors.reading[0],
    contributing: colors.contributing[0],
    content: colors.content[1]
};
const darkColor = {
    reading: colors.reading[3],
    contributing: colors.contributing[3],
    content: colors.content[3]
};

const startDate = Date.parse('1980-01-01T00:00:00Z');

const areasWithMetrics = _.transform(questions, function (result, q) {
    let area = result.find((a) => a.name === q.a);
    if (!area) {
        area = {
            name: q.a,
            order: { reading: 1, contributing: 2, content: 3 }[q.a],
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
    {
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
    },
];

const availableChartTypes = {
    empty   : { chart: 'empty', icon: 'question' },
    bar     : { chart: 'bar', icon: 'bar' },
    line    : { chart: 'line', icon: 'line' },
    map     : { chart: 'map', icon: 'globe' },
    table   : { chart: 'table', icon: 'table' },
};


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
const ANNOTATION_HOST = 'https://meta.wikimedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=content&rawcontinue=1&titles=Config:Dashiki:Annotations/Wikistats/';
const ANNOTATION_HUMAN_READABLE = 'https://meta.wikimedia.org/w/index.php?title=Config:Dashiki:Annotations/Wikistats/';

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

        'legacy-page-views': {
            endpoint: AQS_HOST + '/legacy/pagecounts/aggregate/{{project}}/{{access-site}}/{{granularity}}/{{start}}/{{end}}'
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
    metricConfig (metricName) {
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

    getChartTypes (metricConfig) {
        return {
            map: ['map', 'table'],
            time: (
                metricConfig.additive ?
                ['bar', 'line', 'table'] :
                ['line', 'bar', 'table']
            ),
            list: ['table'],
        }[metricConfig.type].map(k => availableChartTypes[k])
    },

    areas () {
        const areasFromMetrics = new Set();
        _.forEach(metrics, (metric) => {
            areasFromMetrics.add(metric.area);
        });
        const areaList = [
            { path: '', name: 'Dashboard' },
            { path: 'reading', name: 'Reading' },
            { path: 'contributing', name: 'Contributing' },
            { path: 'content', name: 'Content' },
        ].filter(
            (area) => area.path === '' || areasFromMetrics.has(area.path)
        );

        return areaList;
    },

    areaData () {
        return mainMetricsByArea;
    },

    annotationPath (metric) {
        return ANNOTATION_HOST + _.camelCase(metric);
    },

    annotationHumanPath (metric) {
        return ANNOTATION_HUMAN_READABLE + _.camelCase(metric);
    },

    metrics,
    colors,
    qualitativeScale,
    stableColorIndexes,
    questions,
    areasWithMetrics,
    months,
    availableChartTypes,
    startDate,
};

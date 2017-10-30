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
    contributing: ['#c4cddf', '#99afd9', '#6582ba', '#2a4b8d'],
    reading: ['#c8f0e7', '#77d8c2', '#00af89', '#03745c'],
    content: ['#fff1c6', '#f9df90', '#ffcc33', '#ddad1c']
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
                'total-pageviews',
                'unique-devices',
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
                'net-bytes',
                'absolute-bytes'
            ]
        }
    }
];


const metrics = require('./metrics');

const questions = [

    { area: 'contributing', metric: 'Top Contributors', question: 'Who are the top contributors?' },
    { area: 'contributing', metric: 'Active Editors',   question: 'How many active editors are there?' },
    { area: 'contributing', metric: 'Non-bot edits',    question: 'How many edits have been made by registered human users?' },
    { area: 'contributing', metric: 'New Editors',            question: 'How many new editors are there?' },
    { area: 'contributing', metric: 'Newly registered users', question: 'How many new users are there?' },
    { area: 'contributing', metric: 'Total editors',          question: 'How many editors are there?' },
    { area: 'contributing', metric: 'Editors by language',    question: 'How many editors are there in the most populated countries?' },
    { area: 'contributing', metric: 'Total Edits',         question: 'How many edits have been made?' },
    { area: 'contributing', metric: 'Anonymous edits',     question: 'How many edits have been made by anonymous users?' },
    { area: 'contributing', metric: 'Edits per article',   question: 'How many edits does an article receive on average?' },
    { area: 'contributing', metric: 'Top edited articles', question: 'What are the most edited articles?' },
    { area: 'contributing', metric: 'Total Reverts',       question: 'How many edits undo previous edits?' },

    { area: 'reading', metric: 'Total Pageviews',      question: 'How many times are articles viewed?' },
    { area: 'reading', metric: 'Unique Devices',       question: 'How many unique devices access content?' },
    { area: 'reading', metric: 'Most Viewed Articles', question: 'What are the most viewed articles?' },
    { area: 'reading', metric: 'Article Pageviews',    question: 'How many times is an article viewed, on average?' },
    { area: 'reading', metric: 'Page Views per Edit?', question: 'How many times is a particular article version viewed?' },

    { area: 'content', metric: 'Total Articles',    question: 'How many articles are there?' },
    { area: 'content', metric: 'Media Uploads',     question: 'How much media is there (video, sound, images)?' },
    { area: 'content', metric: 'New articles',      question: 'How many new articles are added?' },
    { area: 'content', metric: 'Top Article Creators', question: 'Who are the top article creators?' },
    { area: 'content', metric: 'Article size', question: 'What is the size of all articles in bytes?' },
    { area: 'content', metric: 'Articles with most edits',        question: 'What articles have the most edits?' },
    { area: 'content', metric: 'Articles with most contributors', question: 'What are the articles with the most contributors?' },
    { area: 'content', metric: 'Reference Links', question: 'Where do articles link to?' }
];

// The metric id is inferred from the long name and used to determine whether the metric is enabled
questions.forEach(q => {
    q.id = _.kebabCase(q.metric);
    q.enabled = !!(metrics[q.id]);
});

const AQS_HOST = 'https://wikimedia.org/api/rest_v1/metrics';

export default {

    sitematrix: {
        endpoint: 'https://meta.wikimedia.org/w/api.php?action=sitematrix&formatversion=2&format=json&maxage=3600&smaxage=3600'
    },

    aqs: {
        'total-pageviews': {
            method: 'getAggregatedPageviews',
            endpoint: AQS_HOST + '/pageviews/aggregate/{{project}}/{{access}}/{{agent_type}}/{{granularity}}/{{start}}/{{end}}'
        },

        'unique-devices': {
            method: 'getUniqueDevices',
            endpoint: AQS_HOST + '/unique-devices/{{project}}/{{access-site}}/{{granularity}}/{{start}}/{{end}}'
        },

        'top-viewed-articles': {
            endpoint: AQS_HOST + '/pageviews/top/{{project}}/{{access}}/2015/10/all-days'
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

        'net-bytes': {
            endpoint: AQS_HOST + '/bytes-difference/net/aggregate/{{project}}/{{editor_type}}/{{page_type}}/{{granularity}}/{{start}}/{{end}}'
        },

        'absolute-bytes': {
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

    getColorForBreakdown (breakdown, key) {
        return qualitativeScale[breakdown.values.length][breakdown.values.indexOf(breakdown.values.find(value => value.key === key))]
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
    months
};

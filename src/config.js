import _ from './lodash-custom-bundle';

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
    }
];

const metrics = {
    'total-pageviews': {
        fullName: 'Total Page Views',
        description: 'Page views on Wikimedia projects count the viewing of article content.  In this data we try to exclude bot traffic and focus on human user page views.',
        info_url: 'https://meta.wikimedia.org/wiki/Research:Page_view',
        defaults: {
            unique: {
                project: ['all-projects'],
                access: ['desktop', 'mobile-web', 'mobile-app']
            },
            common: {
                metric: 'total-pageviews',
                agent_type: 'user',
                granularity: 'monthly'
            }
        },
        type: 'lines',
        area: 'reading',
        value: 'views',
        global: true,
        breakdowns: [{
            on: false,
            name: 'Access method',
            breakdownName: 'access',
            values: [
                { name: 'Desktop', on: true, key: 'desktop' },
                { name: 'Mobile App', on: true, key: 'mobile-app' },
                { name: 'Mobile Web', on: true, key: 'mobile-web' }
            ]
        }],
        additive: true
    },
    'unique-devices': {
        fullName: 'Unique Devices',
        description: 'How many distinct devices we have visiting a project in a given time period.',
        info_url: 'https://meta.wikimedia.org/wiki/Research:Unique_Devices',
        type: 'lines',
        defaults: {
            unique: {
                project: ['all-projects'],
                'access-site': ['desktop-site', 'mobile-site']
            },
            common: {
                metric: 'unique-devices',
                granularity: 'monthly'
            }
        },
        value: 'devices',
        area: 'reading',
        global: false,
        breakdowns: [{
            on: false,
            name: 'Access site',
            breakdownName: 'access-site',
            values: [
                { name: 'Mobile Site', on: true, key: 'mobile-site' },
                { name: 'Desktop Site', on: true, key: 'desktop-site' }
            ]
        }],
        additive: false
    },
    'top-viewed-articles': {
        fullName: 'Top Viewed Articles',
        subtitle: 'Most viewed articles',
        info_url: 'https://meta.wikimedia.org/wiki/Research:Page_view',
        type: 'list',
        defaults: {
            unique: {
                project: ['all-projects'],
                access: ['all-access']
            },
            common: {
                metric: 'top-viewed-articles',
                granularity: 'monthly'
            }
        },
        value: 'views',
        valueName: 'Views',
        key: 'article',
        area: 'reading',
        global: false,
        breakdowns: null
    }
};

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



export default {

    sitematrix: {
        endpoint: 'https://meta.wikimedia.org/w/api.php?action=sitematrix&formatversion=2&format=json&maxage=3600&smaxage=3600'
    },

    aqs: {
        'total-pageviews': {
            method: 'getAggregatedPageviews',
            endpoint: 'https://wikimedia.org/api/rest_v1/metrics/pageviews/aggregate/{{project}}/{{access}}/{{agent_type}}/{{granularity}}/{{start}}/{{end}}'
        },

        'unique-devices': {
            method: 'getUniqueDevices',
            endpoint: 'https://wikimedia.org/api/rest_v1/metrics/unique-devices/{{project}}/{{access-site}}/{{granularity}}/{{start}}/{{end}}'
        },

        'top-viewed-articles': {
            endpoint: 'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/{{project}}/{{access}}/2015/10/all-days'
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

    areas () {
        const areasFromMetrics = new Set();
        _.forEach(metrics, (metric) => {
            areasFromMetrics.add(metric.area);
        });
        const areaList = [
            { path: '', name: 'Dashboard' },
            { path: 'contributing', name: 'Contributing' },
            { path: 'reading', name: 'Reading' },
            { path: 'content', name: 'Content' }
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
    stableColorIndexes,
    questions,
    areasWithMetrics,
    months
};

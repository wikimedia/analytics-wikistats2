import _ from './lodash-custom-bundle';

const colors = {
    contributing: ['#c4cddf', '#99afd9', '#6582ba', '#2a4b8d'],
    reading: ['#c8f0e7', '#77d8c2', '#00af89', '#03745c'],
    content: ['#fff1c6', '#f9df90', '#ffcc33', '#ddad1c']
}
const stableColorIndexes = {
    'Lightly Active': 0,
    'Active': 1,
    'Very Active': 2,
    'desktop': 0,
    'mobile-app': 1,
    'mobile-web': 2
}

const lightColor = {
    contributing: colors.contributing[0],
    reading: colors.reading[0],
    content: colors.content[1]
}
const darkColor = {
    contributing: colors.contributing[3],
    reading: colors.reading[3],
    content: colors.content[3]
}

const questions = [
    { f: true, a: 'contributing', m: 'Top Contributors', q: 'Who are the top contributors?' },
    { a: 'contributing', m: 'New Editors', q: 'How many new editors are there?' },
    { a: 'contributing', m: 'Newly registered users', q: 'How many new users are there?' },
    { f: true, a: 'contributing', m: 'Active Editors', q: 'How many active editors are there?' },
    { a: 'contributing', m: 'Total editors', q: 'How many editors are there?' },
    { a: 'contributing', m: 'Editors by language', q: 'How many editors are there in the most populated countries?' },
    { a: 'contributing', m: 'Total Edits', q: 'How many edits have been made?' },
    { f: true, a: 'contributing', m: 'Non-bot edits', q: 'How many edits have been made by registered human users?' },
    { a: 'contributing', m: 'Anonymous edits', q: 'How many edits have been made by anonymous users?' },
    { a: 'contributing', m: 'Edits per article', q: 'How many edits does an article receive on average?' },
    { a: 'contributing', m: 'Top edited articles', q: 'What are the most edited articles?' },
    { a: 'contributing', m: 'Total Reverts', q: 'How many edits undo previous edits?' },
    { f: true, a: 'reading', m: 'Total Pageviews', q: 'How many times are articles viewed?' },
    { f: true, a: 'reading', m: 'Unique Devices', q: 'How many unique devices access content?' },
    { f: true, a: 'reading', m: 'Most Viewed Articles', q: 'What are the most viewed articles?' },
    { a: 'reading', m: 'Article Pageviews', q: 'How many times is an article viewed, on average?' },
    { a: 'reading', m: 'Page Views per Edit?', q: 'How many times is a particular article version viewed?' },
    { f: true, a: 'content', m: 'Total Articles', q: 'How many articles are there?' },
    { f: true, a: 'content', m: 'Media Uploads', q: 'How much media is there (video, sound, images)?' },
    { f: true, a: 'content', m: 'New articles', q: 'How many new articles are added?' },
    { a: 'content', m: 'Top Article Creators', q: 'Who are the top article creators?' },
    { a: 'content', m: 'Article size (bytes)', q: 'What is the size of all articles in bytes?' },
    { a: 'content', m: 'Articles with most edits', q: 'What articles have the most edits?' },
    { a: 'content', m: 'Articles with most contributors', q: 'What are the articles with the most contributors?' },
    { a: 'content', m: 'Reference Links', q: 'Where do articles link to?' }
]

const areasWithMetrics = _.transform(questions, function (result, q) {
    let area = result.find((a) => a.name === q.a)
    if (!area) {
        area = {
            name: q.a,
            order: { contributing: 1, reading: 2, content: 3 }[q.a],
            color: colors[q.a][1],
            metrics: []
        }
        result.unshift(area)
    }

    area.metrics.push({
        name: _.kebabCase(q.m),
        fullName: q.m
    })

    result.sort((a, b) => a.order > b.order)
    return result
}, []);

const mainMetricsByArea = [
    {
        state: {
            id: 'reading',
            name: 'Reading',
            metrics: [
                'total-pageviews'
            ]
        }
    }
];

const metrics = {
    'total-pageviews': {
        fullName: 'Total Page Views',
        description: 'A page view is a request for the content of a web page. Page views on Wikimedia projects is our most important content consumption metric.',
        defaults: {
            unique: {
                project: ['all-projects'],
                access: ['desktop', 'mobile-web', 'mobile-app']
            },
            common: {
                metric: 'pageviews-aggregate',
                agent_type: 'all-agents',
                granularity: 'monthly',
                start: '2015053100',
                end: '2017053100'
            }
        },
        type: 'bars',
        area: 'reading',
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
    },
    'total-pageviews-2': {
        fullName: 'Total Page Views 2',
        description: 'A page view is a request for the content of a web page. Page views on Wikimedia projects is our most important content consumption metric.',
        defaults: {
            unique: {
                project: ['all-projects'],
                access: ['desktop', 'mobile-web', 'mobile-app']
            },
            common: {
                metric: 'pageviews-aggregate',
                agent_type: 'all-agents',
                granularity: 'monthly',
                start: '2015053100',
                end: '2017053100'
            }
        },
        type: 'bars',
        area: 'reading',
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
    }
}


export default {

    sitematrix: {
        endpoint: 'https://meta.wikimedia.org/w/api.php?action=sitematrix&formatversion=2&format=json&maxage=3600&smaxage=3600'
    },

    aqs: {
        'pageviews-aggregate': {
            method: 'getAggregatedPageviews',
            endpoint: 'https://wikimedia.org/api/rest_v1/metrics/pageviews/aggregate/{{project}}/{{access}}/{{agent}}/{{granularity}}/{{start}}/{{end}}'
        },

        'unique-devices': {
            method: 'getUniqueDevices'
        }
    },

    // site config
    metricData (metricName, area) {
        return _.assign(
            metrics[metricName],
            { lightColor: lightColor[area] },
            { darkColor: darkColor[area] }
        )
    },

    areas () {
        const areasFromMetrics = new Set();
        _.forEach(metrics, (metric) => {
            areasFromMetrics.add(metric.area);
        });
        const areaList = [
            { path: '', name: 'Dashboard', exact: true },
            { path: 'contributing', name: 'Contributing' },
            { path: 'reading', name: 'Reading' },
            { path: 'content', name: 'Content' }
        ].filter((area)=> {
            return area.path==='/' || areasFromMetrics.has(area.path.replace('/', ''))
        })

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
};

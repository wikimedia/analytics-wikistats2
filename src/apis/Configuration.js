import _ from 'lodash'

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
const fakeSeries = [
    { month: 'December 2015', metric: 60000 },
    { month: 'January 2016', metric: 70000 },
    { month: 'February 2016', metric: 80000 },
    { month: 'March 2016', metric: 100340 },
    { month: 'April 2016', metric: 80000 },
    { month: 'May 2016', metric: 100340 },
    { month: 'June 2016', metric: 80000 },
    { month: 'July 2016', metric: 100340 },
    { month: 'August 2016', metric: 80000 },
    { month: 'September 2016', metric: 100340 },
    { month: 'October 2016', metric: 80000 },
    { month: 'November 2016', metric: 100340 },
    { month: 'December 2016', metric: 80000 },
    { month: 'January 2017', metric: 90000 },
    { month: 'February 2017', metric: 100000 },
    { month: 'March 2017', metric: 120340 },
    { month: 'April 2017', metric: 100000 },
    { month: 'May 2017', metric: 120340 },
    { month: 'June 2017', metric: 100000 },
    { month: 'July 2017', metric: 120340 },
    { month: 'August 2017', metric: 100000 },
    { month: 'September 2017', metric: 120340 },
    { month: 'October 2017', metric: 100000 },
    { month: 'November', metric: 120340 }
]
const fakeDailySeries = Array.from({ length: 100 }, (el, index) => ({
    day: new Date(2015, 10, index + 1),
    metric: 200 + Math.random() * 600 + index
}))
const detailDailySeries = Array.from({ length: 365 }, (el, index) => ({
    day: new Date(2015, 10, index + 1),
    metric: 40000000 + (Math.random() * 30000000) + (index % 30) * 40000
}))
const detailSeries = [
    { month: '2014-12-01', total: 80000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 70000, 'Very Active': 22000 }
        }
    },
    { month: '2015-01-01', total: 90000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 80000, 'Very Active': 22000 }
        }
    },
    { month: '2015-02-01', total: 100000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 90000, 'Very Active': 22000 }
        }
    },
    { month: '2015-03-01', total: 120340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 100000, 'Very Active': 38000 }
        }
    },
    { month: '2015-04-01', total: 100000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 90000, 'Very Active': 22000 }
        }
    },
    { month: '2015-05-01', total: 120340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 100000, 'Very Active': 38000 }
        }
    },
    { month: '2015-06-01', total: 100000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 90000, 'Very Active': 22000 }
        }
    },
    { month: '2015-07-01', total: 120340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 100000, 'Very Active': 38000 }
        }
    },
    { month: '2015-08-01', total: 100000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 90000, 'Very Active': 22000 }
        }
    },
    { month: '2015-09-01', total: 120340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 100000, 'Very Active': 38000 }
        }
    },
    { month: '2015-10-01', total: 100000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 90000, 'Very Active': 22000 }
        }
    },
    { month: '2015-11-01', total: 120340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 100000, 'Very Active': 38000 }
        }
    },
    { month: '2015-12-01', total: 130340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 110000, 'Very Active': 38000 }
        }
    },
    { month: '2015-12-01', total: 80000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 70000, 'Very Active': 22000 }
        }
    },
    { month: '2016-01-01', total: 90000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 80000, 'Very Active': 22000 }
        }
    },
    { month: '2016-02-01', total: 100000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 90000, 'Very Active': 22000 }
        }
    },
    { month: '2016-03-01', total: 120340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 100000, 'Very Active': 38000 }
        }
    },
    { month: '2016-04-01', total: 100000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 90000, 'Very Active': 22000 }
        }
    },
    { month: '2016-05-01', total: 120340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 100000, 'Very Active': 38000 }
        }
    },
    { month: '2016-06-01', total: 100000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 90000, 'Very Active': 22000 }
        }
    },
    { month: '2016-07-01', total: 120340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 100000, 'Very Active': 38000 }
        }
    },
    { month: '2016-08-01', total: 100000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 90000, 'Very Active': 22000 }
        }
    },
    { month: '2016-09-01', total: 120340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 100000, 'Very Active': 38000 }
        }
    },
    { month: '2016-10-01', total: 100000,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10000, 'Active': 90000, 'Very Active': 22000 }
        }
    },
    { month: '2016-11-01', total: 120340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 100000, 'Very Active': 38000 }
        }
    },
    { month: '2016-12-01', total: 130340,
        breakdowns: {
            'Activity Level': { 'Lightly Active': 10340, 'Active': 110000, 'Very Active': 38000 }
        }
    }
]

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
}, [])

const mainMetricsByArea = [

    { state: { id: 'contributing', name: 'Contributing', metrics: [
        'non-bot-edits',
        'active-editors',
        'top-contributors'
    ] }},
    { state: { id: 'reading', name: 'Reading', metrics: [
        'total-pageviews',
        'unique-devices',
        'most-viewed-articles'
    ] }},
    { state: { id: 'content', name: 'Content', metrics: [
        'total-articles',
        'new-articles',
        'media-uploads'
    ] }}
]
const metrics = {
    'non-bot-edits': {
        fullName: 'Non-bot edits',
        type: 'bars',
        area: 'contributing',
        series: fakeSeries,
        changeMoM: 3,
        changeYoY: 0.5,
        lastMonth: 'November',
        lastMonthValue: 120340,
        lastYear: 2016,
        lastYearValue: 1210000,
        detail: detailSeries
    },
    'active-editors': {
        fullName: 'Active Editors',
        type: 'bars',
        area: 'contributing',
        series: fakeSeries,
        changeMoM: 1,
        changeYoY: -0.5,
        lastMonth: 'November',
        lastMonthValue: 43203,
        lastYear: 2016,
        lastYearValue: 60102,
        breakdowns: [
            { on: true, name: 'Activity Level', values: [
                { name: 'Lightly Active', on: true },
                { name: 'Active', on: true },
                { name: 'Very Active', on: true }
            ] }
        ],
        detail: detailSeries.map((d) => Object.assign(d, { total: d.total + 1 }))
    },
    'top-contributors': {
        fullName: 'Top Contributors',
        type: 'list',
        area: 'contributing',
        valueName: 'Total Edits for November', // make month dynamic?
        valueFilter: 'thousands',
        showNumbers: true,
        sortedList: [
            { name: 'Username 1', value: 124503 },
            { name: 'Username 2', value: 123954 },
            { name: 'Username 3', value: 122031 },
            { name: 'Username 4', value: 110891 }
        ]
    },
    'total-pageviews': {
        fullName: 'Total Page Views',
        metricName: 'pageviews-aggregate',
        type: 'bars',
        area: 'reading',
        series: fakeSeries,
        changeMoM: 3,
        changeYoY: -0.5,
        granularity: 'monthly',
        agent_type: 'all-agents',
        range: ['2015053100', '2017053100'],
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
    'unique-devices': {
        fullName: 'Unique Devices',
        type: 'lines',
        area: 'reading',
        series: fakeDailySeries,
        changeMoM: 3,
        changeYoY: -0.5,
        lastMonth: 'November',
        lastMonthValue: 4921109000,
        lastYear: 2016,
        lastYearValue: 20101345234,
        detail: detailDailySeries
    },
    'most-viewed-articles': {
        fullName: 'Most Viewed Articles',
        type: 'list',
        area: 'reading',
        valueName: 'Total Views November', // make month dynamic?
        valueFilter: 'kmb',
        showNumbers: false,
        sortedList: [
            { name: 'Long article name here one', value: 2103000 },
            { name: 'Long article name here two', value: 2000900 },
            { name: 'Long article name here three', value: 1910000 },
            { name: 'Long article name here four', value: 1800001 }
        ]
    },
    'total-articles': {
        fullName: 'Total Articles',
        type: 'bars',
        area: 'content',
        series: fakeSeries,
        changeMoM: 3,
        changeYoY: -0.5,
        lastMonth: 'November',
        lastMonthValue: 10741345234,
        lastYear: 2016,
        lastYearValue: 25341345234,
        detail: detailSeries
    },
    'new-articles': {
        fullName: 'New Articles',
        type: 'bars',
        area: 'content',
        series: fakeSeries,
        changeMoM: 3,
        changeYoY: -0.5,
        lastMonth: 'November',
        lastMonthValue: 1435321,
        lastYear: 2016,
        lastYearValue: 12445234,
        detail: detailSeries
    },
    'media-uploads': {
        fullName: 'Media Uploads',
        type: 'bars',
        area: 'content',
        series: fakeSeries,
        changeMoM: 3,
        changeYoY: -0.5,
        lastMonth: 'November',
        lastMonthValue: 1940713,
        lastYear: 2016,
        lastYearValue: 2145234,
        detail: detailSeries
    }
}

export default {
    metricData (metricName, area) {
        const promise = new Promise(function (resolve, reject) {
            const result = _.assign(
                metrics[metricName],
                { lightColor: lightColor[area] },
                { darkColor: darkColor[area] }
            )
            setTimeout(() => resolve(result), Math.random() * 500)
        })

        return promise
    },

    metrics () {
        const promise = new Promise(function (resolve, reject) {
            resolve(metrics)
        })

        return promise
    },

    areas () {
        const promise = new Promise(function (resolve, reject) {
            resolve([
                { path: '/', name: 'Dashboard' },
                { path: '/contributing', name: 'Contributing' },
                { path: '/reading', name: 'Reading' },
                { path: '/content', name: 'Content' }
            ])
        })

        return promise
    },

    areaData () {
        const promise = new Promise(function (resolve, reject) {
            resolve(mainMetricsByArea)
        })

        return promise
    },

    colors,
    stableColorIndexes,
    questions,
    areasWithMetrics,

}

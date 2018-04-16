module.exports = {
    'top-viewed-articles': {
        fullName: 'Top Viewed Articles',
        subtitle: 'Most viewed articles',
        description: 'Most viewed articles',
        question: 'What are the most viewed articles?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Page_view',
        type: 'list',
        structure: 'top',
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
        key: 'article',
        arrayName: 'articles',
        area: 'reading',
        global: false,
        additive: true
    },
    'page-views-by-country': {
        fullName: 'Page Views by Country',
        subtitle: 'Countries with the most views',
        description: 'Countries where this project is visited the most. Those countries with less than 100 views are not reported and are blank in the map.',
        question: 'Where are the project\'s visitors coming from?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Page_view',
        type: 'map',
        defaults: {
            unique: {
                project: ['all-projects'],
                access: ['all-access']
            },
            common: {
                metric: 'page-views-by-country',
                granularity: 'monthly'
            }
        },
        value: 'views',
        key: 'country',
        arrayName: 'countries',
        area: 'reading',
        global: true,
        structure: 'top',
        additive: true
    },
    'total-page-views': {
        fullName: 'Total Page Views',
        description: 'Page views on Wikimedia projects count the viewing of article content.  In this data we try to exclude bot traffic and focus on human user page views',
        question: 'How many times are articles viewed?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Page_view',
        defaults: {
            unique: {
                project: ['all-projects'],
                access: ['all-access']
            },
            common: {
                metric: 'total-page-views',
                agent_type: 'user',
                granularity: 'monthly'
            }
        },
        type: 'lines',
        structure: 'timeseries',
        area: 'reading',
        value: 'views',
        global: true,
        breakdowns: [{
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
        description: 'How many distinct devices we have visiting a project in a given time period',
        question: 'How many unique devices access content?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Unique_Devices',
        type: 'lines',
        structure: 'timeseries',
        defaults: {
            unique: {
                project: ['all-projects'],
                'access-site': ['all-sites']
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
            name: 'Access site',
            breakdownName: 'access-site',
            values: [
                { name: 'Mobile Site', on: true, key: 'mobile-site' },
                { name: 'Desktop Site', on: true, key: 'desktop-site' }
            ]
        }],
        additive: false
    },
};

module.exports = {
    'total-page-views': {
        disabled: false,
        fullName: 'Total page views',
        description: 'Page views on Wikimedia projects count the viewing of article content. In this data we try to exclude bot traffic and focus on human user page views',
        question: 'How many times are articles viewed?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Page_view',
        tooltip: 'A page view is a request for the content of a web page. Page views on Wikimedia projects is our most important content consumption metric. The pageview definition tries to count pageviews of content delivered to users',
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
        type: 'time',
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
    'legacy-page-views': {
        disabled: false,
        fullName: 'Legacy page views',
        description: 'Legacy page views are the predecessor of page views. They include data from January 2008 to July 2016.',
        question: 'How many times are articles viewed prior to current page view definition?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Legacy_page_view',
        tooltip: 'Legacy page views on Wikimedia projects count the viewing of article content from January 2008 to July 2016. The main difference compared to current page view data is the lack of filtering of self-reported bots, thus automated and human traffic are reported together.',
        type: 'time',
        structure: 'timeseries',
        legacy: true,
        defaults: {
            unique: {
                project: ['all-projects'],
                'access-site': ['all-sites']
            },
            common: {
                metric: 'legacy-page-views',
                granularity: 'monthly'
            }
        },
        value: 'count',
        area: 'reading',
        global: true,
        breakdowns: [{
            name: 'Access site',
            breakdownName: 'access-site',
            values: [
                { name: 'Mobile Site', on: true, key: 'mobile-site' },
                { name: 'Desktop Site', on: true, key: 'desktop-site' }
            ]
        }],
        additive: true
    },
    'page-views-by-country': {
        disabled: false,
        fullName: 'Page views by country',
        subtitle: 'Countries with the most views',
        description: 'Countries where this project is visited the most. Those countries with less than 100 views are not reported and are blank in the map',
        question: 'Where are the project\'s visitors coming from?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Page_view',
        tooltip: 'A page view is a request for the content of a web page. Page views on Wikimedia projects is our most important content consumption metric. The pageview definition tries to count pageviews of content delivered to users',
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
        value: 'views_ceil',
        valueTitle: 'page views',
        key: 'country',
        arrayName: 'countries',
        area: 'reading',
        global: true,
        structure: 'top',
        additive: true
    },
    'unique-devices': {
        disabled: false,
        fullName: 'Unique devices',
        description: 'How many distinct devices we have visiting a project in a given time period',
        question: 'How many unique devices access content?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Unique_Devices',
        tooltip: 'Unique Devices metric tell us how many distinct devices we have visiting our web properties in a given time period. The Analytics team counts unique devices per project per day and month in a way that does not uniquely identify, fingerprint or otherwise track users.',
        type: 'time',
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
    'top-viewed-articles': {
        disabled: false,
        fullName: 'Top viewed articles',
        subtitle: 'Most viewed articles',
        description: 'Most viewed articles',
        question: 'What are the most viewed articles?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Page_view',
        tooltip: 'A page view is a request for the content of a web page. Page views on Wikimedia projects is our most important content consumption metric. The pageview definition tries to count pageviews of content delivered to users',
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
};

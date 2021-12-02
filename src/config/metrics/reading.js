module.exports = {
    'total-page-views': {
        disabled: false,
        fullName: 'Total page views',
        description: 'Page views on Wikimedia projects count the viewing of article content. By default, this data shows page views from automated traffic as well as human traffic.  To focus on human user page views, please use the Agent type filter.',
        question: 'How many times are articles viewed?',
        infoUrl: 'https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews',
        tooltip: 'A page view is a request for the content of a web page. Page views on Wikimedia projects is our most important content consumption metric. The pageview definition tries to count pageviews of content delivered to users.',
        defaults: {
            unique: {
                project: ['all-projects'],
                access: ['all-access'],
                agent: ['all-agents']
            },
            common: {
                metric: 'total-page-views',
                granularity: 'monthly'
            }
        },
        type: 'time',
        structure: 'timeseries',
        area: 'reading',
        value: 'views',
        global: true,
        knownStart: '2016-01-01',
        breakdowns: [{
            name: 'Access method',
            key: 'access',
            allValue: 'all-access',
            values: [
                { name: 'Desktop', on: true, key: 'desktop' },
                { name: 'Mobile App', on: true, key: 'mobile-app' },
                { name: 'Mobile Web', on: true, key: 'mobile-web' }
            ]
        }, {
            name: 'Agent type',
            key: 'agent',
            allValue: 'all-agents',
            values: [
                { name: 'User', on: true, key: 'user' },
                { name: 'Spider', on: true, key: 'spider' },
                { name: 'Automated', on: true, key: 'automated' },
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
            key: 'access-site',
            allValue: 'all-sites',
            values: [
                { name: 'Mobile Site', on: true, key: 'mobile-site' },
                { name: 'Desktop Site', on: true, key: 'desktop-site' }
            ]
        }],
        knownStart: '2007-12-01',
        knownEnd: '2016-08-31',
        additive: true
    },
    'page-views-by-country': {
        disabled: false,
        fullName: 'Page views by country',
        subtitle: 'Countries with the most views',
        description: 'Countries where this project is visited the most. Those countries with less than 100 views are not reported and are blank in the map',
        question: 'Where are the project\'s visitors coming from?',
        infoUrl: 'https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews#Pageviews_split_by_country',
        tooltip: 'A page view is a request for the content of a web page. Page views on Wikimedia projects is our most important content consumption metric. The pageview definition tries to count pageviews of content delivered to users',
        type: 'map',
        availableGranularities: ['monthly'],
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
        breakdowns: [{
            name: 'Access method',
            key: 'access',
            allValue: 'all-access',
            values: [
                { name: 'Desktop', on: true, key: 'desktop' },
                { name: 'Mobile App', on: true, key: 'mobile-app' },
                { name: 'Mobile Web', on: true, key: 'mobile-web' }
            ]
        }],
        knownStart: '2016-01-01',
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
        truncatedThreshold: 1000,
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
        knownStart: '2016-01-01',
        value: 'devices',
        area: 'reading',
        global: false,
        globalFamily: true,
        splittingCheck: 'ONLY_IF_PER_DOMAIN',
        breakdowns: [{
            name: 'Access site',
            key: 'access-site',
            allValue: 'all-sites',
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
        infoUrl: 'https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews#Most_viewed_articles',
        tooltip: 'A page view is a request for the content of a web page. Page views on Wikimedia projects is our most important content consumption metric. The pageview definition tries to count pageviews of content delivered to users',
        type: 'list',
        structure: 'top',
        knownStart: '2016-01-01',
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
        breakdowns: [{
            name: 'Access method',
            key: 'access',
            allValue: 'all-access',
            values: [
                { name: 'Desktop', on: true, key: 'desktop' },
                { name: 'Mobile App', on: true, key: 'mobile-app' },
                { name: 'Mobile Web', on: true, key: 'mobile-web' }
            ]
        }],
        value: 'views',
        key: 'article',
        arrayName: 'articles',
        area: 'reading',
        global: false,
        additive: true
    },
};

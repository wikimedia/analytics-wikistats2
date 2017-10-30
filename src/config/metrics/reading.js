module.exports = {
    'total-pageviews': {
        fullName: 'Total Page Views',
        description: 'Page views on Wikimedia projects count the viewing of article content.  In this data we try to exclude bot traffic and focus on human user page views.',
        info_url: 'https://meta.wikimedia.org/wiki/Research:Page_view',
        defaults: {
            unique: {
                project: ['all-projects'],
                access: ['all-access']
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
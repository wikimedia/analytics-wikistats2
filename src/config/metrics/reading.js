module.exports = {
    'top-viewed-articles': {
        fullName: 'Top Viewed Articles',
        subtitle: 'Most viewed articles',
        description: 'Most viewed articles',
        question: 'What are the most viewed articles?',
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
        key: 'article',
        area: 'reading',
        global: false,
        additive: true
    },
    'total-pageviews': {
        fullName: 'Total Page Views',
        description: 'Page views on Wikimedia projects count the viewing of article content.  In this data we try to exclude bot traffic and focus on human user page views.',
        question: 'How many times are articles viewed?',
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
        question: 'How many unique devices access content?',
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

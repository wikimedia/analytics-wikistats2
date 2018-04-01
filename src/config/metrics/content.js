module.exports = {
    'absolute-bytes-diff': {
        fullName: 'Absolute bytes diff',
        description: 'The sum of the absolute differences in bytes made by each edit (or revision), including edits on redirects. In other words, counting negative differences as positive',
        question: 'What are the total number of bytes added and removed?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Bytes#Absolute_Bytes_Difference',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['all-editor-types'],
                page_type: ['all-page-types']
            },
            common: {
                granularity: 'monthly',
                metric: 'absolute-bytes-diff'
            }
        },
        type: 'bars',
        structure: 'timeseries',
        area: 'content',
        value: 'abs_bytes_diff',
        unit: 'bytes',
        global: true,
        breakdowns: [{
            name: 'User type',
            breakdownName: 'editor_type',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            name: 'Page type',
            breakdownName: 'page_type',
            values: [
                { name: 'Content', on: true, key: 'content' },
                { name: 'Non content', on: true, key: 'non-content' }
            ]
        }],
        additive: false
    },
    'edited-pages': {
        fullName: 'Edited pages',
        description: 'The number of pages edited, excluding redirect pages',
        question: 'How many pages are edited?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Edited_pages',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['all-editor-types'],
                page_type: ['all-page-types'],
                activity_level: ['all-activity-levels']
            },
            common: {
                granularity: 'monthly',
                metric: 'edited-pages'
            }
        },
        type: 'lines',
        structure: 'timeseries',
        area: 'content',
        value: 'edited_pages',
        global: false,
        breakdowns: [{
            name: 'Editor type',
            breakdownName: 'editor_type',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            name: 'Page type',
            breakdownName: 'page_type',
            values: [
                { name: 'Content', on: true, key: 'content' },
                { name: 'Non content', on: true, key: 'non-content' }
            ]
        },{
            name: 'Activity level',
            breakdownName: 'activity_level',
            values: [
                { name: '1 to 4 edits', key: '1..4-edits', on: true },
                { name: '5 to 24 edits', key: '5..24-edits', on: true },
                { name: '25 to 99 edits', key: '25..99-edits', on: true },
                { name: '100 or more edits', key: '100..-edits', on: true }
            ]
        }],
        additive: true
    },
    'net-bytes-difference': {
        fullName: 'Net bytes difference',
        description: 'The sum of the differences in bytes made by each edit (or revision), including edits on redirects',
        question: 'How did the overall size in bytes change since last period?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Bytes#Net_Bytes_Difference',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['all-editor-types'],
                page_type: ['all-page-types']
            },
            common: {
                granularity: 'monthly',
                metric: 'net-bytes-difference'
            }
        },
        type: 'bars',
        structure: 'timeseries',
        area: 'content',
        unit: 'bytes',
        value: 'net_bytes_diff',
        global: true,
        breakdowns: [{
            name: 'User type',
            breakdownName: 'editor_type',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            name: 'Page type',
            breakdownName: 'page_type',
            values: [
                { name: 'Content', on: true, key: 'content' },
                { name: 'Non content', on: true, key: 'non-content' }
            ]
        }],
        additive: false
    },
};

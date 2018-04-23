module.exports = {
    'editors': {
        disabled: false,
        fullName: 'Editors',
        description: 'The count of editors with one or more edits, including on redirect pages',
        question: 'How many editors are there?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Editors',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['all-editor-types'],
                page_type: ['all-page-types'],
                activity_level: ['all-activity-levels']
            },
            common: {
                granularity: 'monthly',
                metric: 'editors'
            }
        },
        type: 'lines',
        structure: 'timeseries',
        area: 'contributing',
        value: 'editors',
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
    'edits': {
        disabled: false,
        fullName: 'Edits',
        description: 'The count of edits (or revisions), including edits on redirects',
        question: 'How many edits have been made?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Edits',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['all-editor-types'],
                page_type: ['all-page-types']
            },
            common: {
                metric: 'edits',
                granularity: 'monthly'
            }
        },
        type: 'lines',
        structure: 'timeseries',
        area: 'contributing',
        value: 'edits',
        global: true,
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
        }],
        additive: true
    },
    'new-pages': {
        disabled: false,
        fullName: 'New pages',
        description: 'The count of new pages created, excluding pages being redirects',
        question: 'How many new pages each month?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/New_pages',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['all-editor-types'],
                page_type: ['all-page-types']
            },
            common: {
                granularity: 'monthly',
                metric: 'new-pages'
            }
        },
        type: 'bars',
        structure: 'timeseries',
        area: 'contributing',
        value: 'new_pages',
        global: true,
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
        }],
        additive: false
    },
    'new-registered-users': {
        disabled: false,
        fullName: 'New registered users',
        description: 'The count of newly self-created registered users',
        question: 'How many new users are there?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Newly_registered_user',
        defaults: {
            unique: {
                project: ['all-projects']
            },
            common: {
                granularity: 'monthly',
                metric: 'new-registered-users'
            }
        },
        type: 'bars',
        structure: 'timeseries',
        area: 'contributing',
        value: 'new_registered_users',
        global: true,
        additive: false
    },
};

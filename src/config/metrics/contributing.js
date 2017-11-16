module.exports = {
    'editors': {
        disabled: true,
        fullName: 'Editors',
        description: 'Number of editors at a time period.',
        question: 'How many editors are there?',
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
        area: 'contributing',
        value: 'editors',
        global: false,
        breakdowns: [{
            on: false,
            name: 'Editor type',
            breakdownName: 'editor_type',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            on: false,
            name: 'Page type',
            breakdownName: 'page_type',
            values: [
                { name: 'Content', on: true, key: 'content' },
                { name: 'Non content', on: true, key: 'non-content' }
            ]
        },{
            on: false,
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
        fullName: 'Edits',
        description: 'Number of wiki edits in a time period',
        question: 'How many edits have been made?',
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
        area: 'contributing',
        value: 'edits',
        global: true,
        breakdowns: [{
            on: false,
            name: 'Editor type',
            breakdownName: 'editor_type',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            on: false,
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
        disabled: true,
        fullName: 'New pages',
        description: 'New pages is the page creations and page restores minus page deletions, measured monthly',
        question: 'How many new pages each month?',
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
        area: 'contributing',
        value: 'new_pages',
        global: true,
        breakdowns: [{
            on: false,
            name: 'Editor type',
            breakdownName: 'editor_type',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            on: false,
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
        fullName: 'New registered users',
        description: 'Newly self-created registered users counts',
        question: 'How many new users are there?',
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
        area: 'contributing',
        value: 'new_registered_users',
        global: true,
        additive: false
    },
};

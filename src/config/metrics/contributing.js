module.exports = {
    'editors': {
        disabled: false,
        fullName: 'Editors',
        description: 'The count of editors with one or more edits, including on redirect pages',
        question: 'How many editors are there?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Editors',
        tooltip: 'The count of editors with one or more edits, including on redirect pages. The metric can be split and filtered by Editor Type, Page Type, and Activity Level.',
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
        type: 'time',
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
        additive: false
    },
    'edits': {
        disabled: false,
        fullName: 'Edits',
        description: 'The count of edits (or revisions), including edits on redirects',
        question: 'How many edits have been made?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Edits',
        tooltip: 'The count of edits (or revisions), including edits on redirects. The metric can be split and filtered by Editor Type and Page Type.',
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
        type: 'time',
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
        tooltip: 'The count of new pages created, excluding pages being redirects. We measure this by adding up the creations and restores of old pages, and subtracting the page deletions for a given month. The metric can be split and filtered by Editor Type and Page Type.',
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
        type: 'time',
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
        additive: true
    },
    'new-registered-users': {
        disabled: false,
        fullName: 'New registered users',
        description: 'The count of newly self-created registered users',
        question: 'How many new users are there?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Newly_registered_user',
        tooltip: 'Newly registered user is a standardized user class used to measure number of new users signing up on a given wiki project for the first time. It is used as a proxy for user acquisition.',
        defaults: {
            unique: {
                project: ['all-projects']
            },
            common: {
                granularity: 'monthly',
                metric: 'new-registered-users'
            }
        },
        type: 'time',
        structure: 'timeseries',
        area: 'contributing',
        value: 'new_registered_users',
        global: true,
        additive: true
    },
    'top-editors': {
        disabled: false,
        fullName: 'Top editors',
        subtitle: 'Most prolific users',
        description: 'Most prolific editors',
        question: 'Who are the users that edit the most articles?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Top_editors',
        type: 'list',
        structure: 'top',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['all-editor-types'],
                page_type: ['all-page-types']
            },
            common: {
                metric: 'top-editors',
                granularity: 'monthly'
            }
        },
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
        value: 'edits',
        key: 'user_text',
        arrayName: 'top',
        area: 'contributing',
        global: false,
        additive: false,
        availabilityBuffer: 15
    },
    'top-edited-pages': {
        disabled: false,
        fullName: 'Top edited pages',
        subtitle: 'Pages with the most edits',
        description: 'Most edited pages',
        question: 'Which are the pages with the most edits?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Top_edited_pages',
        type: 'list',
        structure: 'top',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['all-editor-types'],
                page_type: ['all-page-types']
            },
            common: {
                metric: 'top-edited-pages',
                granularity: 'monthly'
            }
        },
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
        value: 'edits',
        key: 'page_title',
        arrayName: 'top',
        area: 'contributing',
        global: false,
        additive: false,
        availabilityBuffer: 15
    }
};

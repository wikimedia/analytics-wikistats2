module.exports = {
    'editors': {
        disabled: false,
        fullName: 'Editors',
        description: 'The count of editors with one or more edits, including on redirect pages',
        question: 'How many editors are there?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Editors',
        tooltip: 'The count of editors with one or more edits, including on redirect pages.',
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
        globalFamily: false,
        breakdowns: [{
            name: 'Editor type',
            key: 'editor_type',
            allValue: 'all-editor-types',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            name: 'Page type',
            key: 'page_type',
            allValue: 'all-page-types',
            values: [
                { name: 'Content', on: true, key: 'content' },
                { name: 'Non content', on: true, key: 'non-content' }
            ]
        },{
            name: 'Activity level',
            key: 'activity_level',
            allValue: 'all-activity-levels',
            values: [
                { name: '1 to 4 edits', key: '1..4-edits', on: true },
                { name: '5 to 24 edits', key: '5..24-edits', on: true },
                { name: '25 to 99 edits', key: '25..99-edits', on: true },
                { name: '100 or more edits', key: '100..-edits', on: true }
            ]
        }],
        additive: false
    },
    'active-editors': {
        disabled: false,
        basedOn: 'editors',
        fullName: 'Active editors',
        metricGroup: 'wikistats1',
        description: 'The count of registered user editors with five or more edits, including on redirect pages',
        question: 'How many active registered editors are there?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Active_editors',
        wikistats1URL: 'https://stats.wikimedia.org/EN/TablesWikipediansEditsGt5.htm',
        tooltip: 'The count of editors with five or more edits, including on redirect pages.',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['user'],
                page_type: ['all-page-types'],
                activity_level: ['5..24-edits', '25..99-edits', '100..-edits']
            },
            common: {
                granularity: 'monthly',
                metric: 'editors',
            }
        },
        breakdowns: [{
            name: 'Page type',
            key: 'page_type',
            allValue: 'all-page-types',
            values: [
                { name: 'Content', on: true, key: 'content' },
                { name: 'Non content', on: true, key: 'non-content' }
            ]
        },{
            name: 'Editor type',
            locked: true,
            key: 'editor_type',
            allValue: 'all-editor-types',
            values: [
                { name: 'Anonymous', on: false, key: 'anonymous' },
                { name: 'Group bot', on: false, key: 'group-bot' },
                { name: 'Name bot', on: false, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            name: 'Activity level',
            locked: true,
            key: 'activity_level',
            allValue: 'all-activity-levels',
            values: [
                { name: '1 to 4 edits', key: '1..4-edits', on: false },
                { name: '5 to 24 edits', key: '5..24-edits', on: true },
                { name: '25 to 99 edits', key: '25..99-edits', on: true },
                { name: '100 or more edits', key: '100..-edits', on: true }
            ]
        }]
    },
    'edits': {
        disabled: false,
        fullName: 'Edits',
        description: 'The count of edits (or revisions), including edits on redirects',
        question: 'How many edits have been made?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Edits',
        tooltip: 'The count of edits (or revisions), including edits on redirects.',
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
        globalFamily: true,
        breakdowns: [{
            name: 'Editor type',
            key: 'editor_type',
            allValue: 'all-editor-types',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            name: 'Page type',
            key: 'page_type',
            allValue: 'all-page-types',
            values: [
                { name: 'Content', on: true, key: 'content' },
                { name: 'Non content', on: true, key: 'non-content' }
            ]
        }],
        additive: true
    },
    'user-edits': {
        disabled: false,
        basedOn: 'edits',
        metricGroup: 'wikistats1',
        fullName: 'User edits',
        description: 'The count of edits (or revisions) made by human users',
        question: 'How many edits have been made by users?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/User_Edits',
        tooltip: 'The count of edits (or revisions) by users, including edits on redirects.',
        wikistats1URL: 'https://stats.wikimedia.org/EN/TablesDatabaseEdits.htm',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['user'],
                page_type: ['all-page-types']
            },
            common: {
                metric: 'edits',
                granularity: 'monthly'
            }
        },
        breakdowns: [{
            name: 'Page type',
            key: 'page_type',
            allValue: 'all-page-types',
            values: [
                { name: 'Content', on: true, key: 'content' },
                { name: 'Non content', on: true, key: 'non-content' }
            ]
        },
        {
            name: 'Editor type',
            key: 'editor_type',
            allValue: 'all-editor-types',
            locked: true,
            values: [
                { name: 'Anonymous', on: false, key: 'anonymous' },
                { name: 'Group bot', on: false, key: 'group-bot' },
                { name: 'Name bot', on: false, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        }]
    },
    'new-pages': {
        disabled: false,
        fullName: 'New pages',
        description: 'The count of new pages created, excluding pages being redirects',
        question: 'How many new pages each month?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/New_pages',
        tooltip: 'The count of new pages created, excluding pages being redirects. We measure this by adding up the creations and restores of old pages, and subtracting the page deletions for a given month.',
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
        globalFamily: true,
        breakdowns: [{
            name: 'Editor type',
            key: 'editor_type',
            allValue: 'all-editor-types',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            name: 'Page type',
            key: 'page_type',
            allValue: 'all-page-types',
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
        tooltip: 'Number of new users signing up on a given wiki project for the first time. Used as a proxy for user acquisition.',
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
        globalFamily: true,
        additive: true
    },
    'top-editors': {
        disabled: false,
        fullName: 'Top editors',
        subtitle: 'Most prolific users',
        description: 'Most prolific editors',
        question: 'Who are the users that edit the most articles?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Top_editors',
        tooltip: 'Editors ranked by number of edits.',
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
            key: 'editor_type',
            allValue: 'all-editor-types',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            name: 'Page type',
            key: 'page_type',
            allValue: 'all-page-types',
            values: [
                { name: 'Content', on: true, key: 'content' },
                { name: 'Non content', on: true, key: 'non-content' }
            ]
        }],
        value: 'edits',
        key: 'user_text',
        arrayName: 'top',
        area: 'contributing',
        global: true,
        globalFamily: true,
        additive: false
    },
    'top-edited-pages': {
        disabled: false,
        fullName: 'Top edited pages',
        subtitle: 'Pages with the most edits',
        description: 'Most edited pages',
        question: 'Which are the pages with the most edits?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Top_edited_pages',
        tooltip: 'Pages ranked by number of edits.',
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
            key: 'editor_type',
            allValue: 'all-editor-types',
            values: [
                { name: 'Anonymous', on: true, key: 'anonymous' },
                { name: 'Group bot', on: true, key: 'group-bot' },
                { name: 'Name bot', on: true, key: 'name-bot' },
                { name: 'User', on: true, key: 'user' },
            ]
        },{
            name: 'Page type',
            key: 'page_type',
            allValue: 'all-page-types',
            values: [
                { name: 'Content', on: true, key: 'content' },
                { name: 'Non content', on: true, key: 'non-content' }
            ]
        }],
        value: 'edits',
        key: 'page_title',
        arrayName: 'top',
        area: 'contributing',
        global: true,
        additive: false,
        globalFamily: true
    }
};

module.exports = {
    'absolute-bytes-diff': {
        disabled: false,
        fullName: 'Absolute bytes diff',
        description: 'The sum of the absolute differences in bytes made by each edit (or revision), including edits on redirects. In other words, counting negative differences as positive',
        question: 'What are the total number of bytes added and removed?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Bytes#Absolute_Bytes_Difference',
        tooltip: 'The sum of the absolute differences in bytes made by each edit (or revision), including edits on redirects. In other words, counting negative differences as positive.',
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
        type: 'time',
        structure: 'timeseries',
        area: 'content',
        value: 'abs_bytes_diff',
        unit: 'bytes',
        global: true,
        globalFamily: true,
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
    'edited-pages': {
        disabled: false,
        fullName: 'Edited pages',
        description: 'The number of pages edited, excluding redirect pages',
        question: 'How many pages are edited?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Edited_pages',
        tooltip: 'The number of pages edited, excluding redirect pages.',
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
        type: 'time',
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
        additive: false
    },
    'net-bytes-difference': {
        disabled: false,
        fullName: 'Net bytes difference',
        description: 'The sum of the differences in bytes made by each edit (or revision), including edits on redirects',
        question: 'How did the overall size in bytes change since last period?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Bytes#Net_Bytes_Difference',
        tooltip: 'The sum of the differences in bytes made by each edit (or revision), including edits on redirects.',
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
        type: 'time',
        structure: 'timeseries',
        area: 'content',
        unit: 'bytes',
        value: 'net_bytes_diff',
        global: true,
        globalFamily: true,
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
    'pages-to-date': {
        disabled: false,
        fullName: 'Pages to date',
        description: 'The running count of all pages created, excluding pages being redirects',
        question: 'How many pages are there in the project right now?',
        infoUrl: 'https://meta.wikimedia.org/wiki/Research:Wikistats_metrics/Pages_to_date',
        tooltip: 'The running count of all pages created, excluding pages being redirects. We measure this by adding up the creations and restores of old pages, and subtracting the page deletions for a given month.',
        defaults: {
            unique: {
                project: ['all-projects'],
                editor_type: ['all-editor-types'],
                page_type: ['all-page-types']
            },
            common: {
                granularity: 'monthly',
                metric: 'pages-to-date'
            }
        },
        type: 'time',
        structure: 'timeseries',
        area: 'content',
        value: 'new_pages',
        global: true,
        globalFamily: true,
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
        additive: false,
        cumulative: true
    },
    'total-mediarequests': {
        disabled: false,
        fullName: 'Total media requests',
        description: 'The total amount of requests directed to media files such as image, video and audio',
        question: 'How many times were media files requested?',
        infoUrl: '',
        tooltip: 'The total amount of requests directed to media files such as image, video and audio.',
        defaults: {
            unique: {
                referer: ['all-referers'],
                media_type: ['all-media-types'],
                agent: ['all-agents']
            },
            common: {
                granularity: 'monthly',
                metric: 'total-mediarequests'
            }
        },
        knownStart: '2015-01-01',
        type: 'time',
        structure: 'timeseries',
        area: 'content',
        value: 'requests',
        global: true,
        breakdowns: [{
            name: 'Media type',
            breakdownName: 'media_type',
            values: [
                { name: 'Image', on: true, key: 'image' },
                { name: 'Video', on: true, key: 'video' },
                { name: 'Audio', on: true, key: 'audio' },
                { name: 'Document', on: true, key: 'document' },
                { name: 'Other', on: true, key: 'other' },
            ]
        },{
            name: 'Agent type',
            breakdownName: 'agent',
            values: [
                { name: 'User', on: true, key: 'user' },
                { name: 'Spider', on: true, key: 'spider' }
            ]
        }],
        additive: true
    },
    'top-mediarequests': {
        disabled: false,
        fullName: 'Top files by mediarequests',
        description: 'A list of the most requested media files, split by file type',
        question: 'Which are the most popular media files?',
        infoUrl: '',
        tooltip: 'The total amount of requests directed to media files such as image, video and audio.',
        defaults: {
            unique: {
                referer: ['all-referers'],
                media_type: ['all-media-types']
            },
            common: {
                granularity: 'monthly',
                metric: 'top-mediarequests'
            }
        },
        knownStart: '2015-01-01',
        type: 'list',
        structure: 'top',
        area: 'content',
        value: 'requests',
        key: 'file_path',
        arrayName: 'files',
        global: true,
        additive: true,
        breakdowns: [{
            name: 'Media type',
            breakdownName: 'media_type',
            values: [
                { name: 'Image', on: true, key: 'image' },
                { name: 'Video', on: true, key: 'video' },
                { name: 'Audio', on: true, key: 'audio' },
                { name: 'Document', on: true, key: 'document' },
                { name: 'Other', on: true, key: 'other' },
            ]
        }]
    }
};

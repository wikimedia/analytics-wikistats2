const metricSchema = {
    additive: {
        type: 'boolean',
        required: true
    },
    area: {
        type: 'string',
        required: true,
        possibleValues: ['reading', 'contributing', 'content']
    },
    arrayName: {
        type: 'string',
        required: false
    },
    availableGranularities: {
        type: 'array',
        required: false
    },
    basedOn: {
        type: 'string',
        required: false
    },
    breakdowns: {
        type: 'array',
        required: false,
        schema: {
            name: {
                type: 'string',
                required: true
            },
            breakdownName: {
                type: 'string',
                required: true
            },
            values: {
                type: 'array',
                required: true
            }
        }
    },
    breakdownCheck: {
        type: 'string',
        required: false
    },
    cumulative: {
        type: 'boolean',
        required: false
    },
    defaults: {
        type: 'object',
        required: true
    },
    description: {
        type: 'string',
        required: true
    },
    disabled: {
        type: 'boolean',
        required: false
    },
    fullName: {
        type: 'string',
        required: true
    },
    global: {
        type: 'boolean',
        required: false
    },
    globalFamily: {
        type: 'boolean',
        required: false
    },
    infoUrl: {
        type: 'string',
        required: false
    },
    key: {
        type: 'string',
        required: false
    },
    knownEnd: {
        type: 'string',
        required: false
    },
    knownStart: {
        type: 'string',
        required: false
    },
    metricGroup: {
        type: 'string',
        required: false
    },
    question: {
        type: 'string',
        required: false
    },
    structure: {
        type: 'string',
        required: true,
        possibleValues: ['top', 'timeseries']
    },
    subtitle: {
        type: 'string',
        required: false
    },
    tooltip: {
        type: 'string',
        required: false
    },
    type: {
        type: 'string',
        required: true,
        possibleValues: ['time', 'map', 'list']
    },
    unit: {
        type: 'string',
        required: false
    },
    value: {
        type: 'string',
        required: true
    },
    valueTitle: {
        type: 'string',
        required: false
    },
    wikistats1URL: {
        type: 'string',
        required: false
    }
};

export default metricSchema;

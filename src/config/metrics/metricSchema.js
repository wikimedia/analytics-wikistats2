const metricSchema = {
    fullName: {
        type: 'string',
        required: true
    },
    description: {
        type: 'string',
        required: true
    },
    subtitle: {
        type: 'string',
        required: false
    },
    question: {
        type: 'string',
        required: false
    },
    info_url: {
        type: 'string',
        required: false
    },
    disabled: {
        type: 'boolean',
        required: false
    },
    defaults: {
        type: 'object',
        required: true
    },
    type: {
        type: 'string',
        required: true,
        possibleValues: ['bars', 'lines', 'list']
    },
    area: {
        type: 'string',
        required: true,
        possibleValues: ['reading', 'contributing', 'content']
    },
    key: {
        type: 'string',
        required: false
    },
    value: {
        type: 'string',
        required: true
    },
    global: {
        type: 'boolean',
        required: false
    },
    breakdowns: {
        type: 'array',
        required: false,
        schema: {
            on: {
                type: 'boolean',
                required: true
            },
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
    additive: {
        type: 'boolean',
        required: true
    },
    unit: {
        type: 'string',
        required: false
    }
};

export default metricSchema;
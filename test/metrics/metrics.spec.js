import metrics from '../../src/config/metrics';
import metricsSchema from '../../src/config/metrics/metricSchema';
import _ from 'lodash';

_.forEach(metrics, (metric) => {
    describe('Metric ' + metric.fullName, () => {
        it('should only contain properties defined in schema', () => {
            expect(keysMatchSchema(metric, metricsSchema)).toBe(true);
        });
        it('should not be missing any required properties', () => {
            expect(containsAllRequired(metric, metricsSchema)).toBe(true);
        });
        it('\'s values should have a type matching the one described in the schema', () => {
            expect(valuesAreValid(metric, metricsSchema)).toBe(true);
        });
        it('should have valid breakdown values', () => {
            expect(breakdownsAreValid(metric, metricsSchema)).toBe(true);
        });
    })
})

function keysMatchSchema (metric, schema) {
    const schemaKeys = Object.keys(schema);
    const metricKeys = Object.keys(metric);
    const diff = _.difference(metricKeys, schemaKeys)
    if (diff.length > 0) {
        throw new Error("Properties " + diff + " are not described in schema.");
    }
    return true;
}

function containsAllRequired (metric, schema) {
    const schemaRequired = Object.keys(schema).filter((key) => schema[key].required);
    const metricKeys = Object.keys(metric);
    const diff = _.difference(schemaRequired, metricKeys);
    if (diff.length > 0) {
        throw new Error("Required properties " + diff + " are missing from the metric definition.");
    }
    return true;
}

function valuesAreValid (metric, schema) {
    _.forEach(metric, (metricValue, key) => {
        const propertySchemaDefinition = schema[key];
        const type = typeof metricValue;
        switch (propertySchemaDefinition.type) {
            case 'array':
                const isArray = Array.isArray(metricValue);
                if (!isArray) {
                    throwUnmatchedType(key, propertySchemaDefinition.type, type);
                }
                break;
            case 'string':
                const possibleValues = propertySchemaDefinition.possibleValues;
                if (possibleValues && !possibleValues.find(() => metricValue)) {
                    throw new Error ('Property ' + key + 'can only be one of these values: ' + possibleValues);
                }
            default:
                if (type !== propertySchemaDefinition.type) {
                    throwUnmatchedType (key, propertySchemaDefinition.type, type);
                }
                break;
        }
    });
    return true;
}

function breakdownsAreValid (metric, schema) {
    const metricValue = metric.breakdowns;
    if (!metricValue) return true;
    const breakdownDefinition = schema.breakdowns;
    metricValue.forEach(v =>
        valuesAreValid(v, breakdownDefinition.schema) &&
        keysMatchSchema(v, breakdownDefinition.schema) &&
        containsAllRequired(v, breakdownDefinition.schema)
    );
    return true;
}

function throwUnmatchedType (key, expectedType, type) {
    throw new Error ('Expected property ' + key + ' to be of type ' + propertySchemaDefinition.type + '. Got ' + type + ' instead.');
}

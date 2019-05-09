import * as topojson from 'topojson-client';
import borders from './world-50m';
import isoLookup from './isoLookup';

const numericLookup = {};
Object.keys(isoLookup).forEach(k => {
    const v = isoLookup[k];
    numericLookup[v.numericCode] = {
        iso: k,
        name: v.en,
    };
});

borders.objects.countries.geometries.forEach(f => {
    f.properties = { name: numericLookup[f.id].name };
});

/**
 * A function that given a scale and data can produce:
 *      - colored, named, and valued features of countries of the world
 */
export default (colorScale, dataByCountry) => {
    borders.objects.countries.geometries.forEach(f => {
        f.properties.number = dataByCountry[numericLookup[f.id].iso] || null;
        f.properties.color = colorScale(f.properties.number || colorScale.min);
    });

    return topojson.feature(borders, borders.objects.countries).features;
}
// NOTE: an unused darkenColorBy function was removed with this change

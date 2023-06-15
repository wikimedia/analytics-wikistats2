import * as topojson from 'topojson-client';
// Source for geojson: https://github.com/topojson/world-atlas
//   Modifications:
//      Removed entities not found on:
//      https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
//          - Somaliland, arcs: [[-115,-581,-583,583]]
//          - N. Cyprus, arcs: [[570,571]]
//          - Indian Ocean Ter.
//          - Siachen Glacier, arcs:[[-756,-1510,-1185]]
import borders from './countries-50m';
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
        f.properties.color = colorScale(f.properties.number);
    });

    return topojson.feature(borders, borders.objects.countries).features;
}

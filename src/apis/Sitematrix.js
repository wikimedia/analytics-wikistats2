/**
 * Gets the wikimedia sitematrix (endpoint in config) and parses it.
 */
import _ from 'lodash';
//import $ from 'jquery';
import config from '../config';

let matrix = $.ajax({

    url: config.sitematrix.endpoint,
    // wikimedia api doesn't allow CORS from non-whitelisted domains
    dataType: 'jsonp',
    // otherwise jquery takes the liberty of not caching your jsonp requests
    cache: true

});

function stripUrl (url) {
    return url.replace(/https:\/\/(www\.)?/, '');
}

let lookup = matrix.then(function (data) {

    let result = {
        'all': 'all-projects',
        'all-projects':'all-projects'
    };

    _.forEach(data.sitematrix, function (languageGroup) {
        // special projects like commons are configured differently
        let next = languageGroup.site || languageGroup;

        _.forEach(next, function (site) {
            var urlEndpoint = stripUrl(site.url);
            result[site.dbname] = urlEndpoint;
            result[urlEndpoint] = site.dbname;
        });
    });

    return result;
});


export default {
    /**
     * Given a project db will return the project url from the sitematrix
     * If url is not found it will throw an error
     */
    getProjectUrl (dbname) {
        return lookup.then(function (lookup) {
            const found = lookup[dbname];
            if (!found) { throw 'Could not find url for project!'; }
            return found;
        });
    },

    /**
     * Returns an array of project families (Wikipedia, Wiktionary, etc.)
     *   with their corresponding projects nested (enwiki, dewiki, etc.):
     *
     *   [
     *      { id: 'wiki', title: 'Wikipedia',
     *        projects: [
     *          { id: 'enwiki', title 'Wikipedia - English', address: 'en.wikipedia.org', description: ... },
     *          ...
     *        ]},
     *      ...
     */
    getByProjectFamily () {

        return matrix.then(function test (data) {
            let inEnglish = {};

            return Object.values(_.transform(data.sitematrix, function (byFamily, languageGroup, code) {
                if (code === 'count') { return byFamily; }

                _.forEach(languageGroup.site || languageGroup, function (site) {
                    if (site.private || site.closed) { return; }

                    if (!(site.code in byFamily)) {
                        byFamily[site.code] = {
                            id: site.code,
                            projects: [],
                        };
                    }

                    if (languageGroup.code === 'en') {
                        inEnglish[site.code] = site.sitename;
                    }
                    byFamily[site.code].title = languageGroup.site ? inEnglish[site.code] : _.capitalize(site.code);

                    byFamily[site.code].projects.push({
                        id: site.dbname,
                        address: stripUrl(site.url),
                        title: languageGroup.site ? languageGroup.localname : site.sitename,
                        description: `${site.sitename} at ${site.url}`,
                    });
                });

                return byFamily;

            }, {
                all: {
                    id: 'all', title: 'All Projects', projects: [{
                        id: 'all',
                        address: 'all-projects',
                        title: 'All Languages',
                        description: 'Aggregate data for all projects'
                    }],
                }
            })).map(f => {
                let sorted = f.projects.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);

                if (sorted.length > 1) {
                    sorted.splice(0, 0, {
                        id: 'all',
                        // TODO: make this "all languages for this project"
                        address: 'all-projects',
                        title: 'All Languages',
                        description: `Aggregate data for all ${f.title} languages`
                    });
                }

                return Object.assign(f, {
                    projects: sorted
                });
            });
        });
    },
};

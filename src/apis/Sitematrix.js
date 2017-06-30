/**
 * Gets the wikimedia sitematrix (endpoint in config) and parses it.
 */
import _ from 'lodash';
//import $ from 'jquery';
import config from '../config';

const separator = ' – ';
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
     * Given a family and a project, merges them into a standard object that all wikistats
     * can understand
     */
    makeProject (f, p) {
        const { family } = f;
        const { code, dbname } = p;
        const title = `${f.title}${separator}${p.title}`;

        return { family, code, title, dbname };
    },

    /**
     * Finds a project by its family and code ({wiki, en.wikipedia}, {all, all-projects}, etc.)
     */
    findByFamilyAndCode (family, code) {
        return this.getByProjectFamily().then((byFamily) => {
            const f = byFamily.find(x => x.family === family) || { projects: [] };
            const p = f.projects.find(x => x.code === code);

            if (f && p) {
                return this.makeProject(f, p);
            }
        });
    },

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
     *      { family: 'wiki', title: 'Wikipedia',
     *        projects: [
     *          { title 'Wikipedia – English', description: ...,
     *            code: 'en.wikipedia.org', dbname: 'enwiki' },
     *          ...
     *        ]},
     *      ...
     */
    getByProjectFamily () {

        return matrix.then(function test (data) {
            let inEnglish = {};

            return Object.values(_.transform(data.sitematrix, function (byFamily, languageGroup, key) {
                if (key === 'count') { return byFamily; }

                _.forEach(languageGroup.site || languageGroup, function (project) {
                    if (project.private || project.closed) { return; }

                    if (!(project.code in byFamily)) {
                        byFamily[project.code] = {
                            family: project.code,
                            projects: [],
                        };
                    }

                    if (languageGroup.code === 'en') {
                        inEnglish[project.code] = project.sitename;
                    }
                    byFamily[project.code].title = languageGroup.site ? inEnglish[project.code] : _.capitalize(project.code);

                    byFamily[project.code].projects.push({
                        title: languageGroup.site ? languageGroup.localname : project.sitename,
                        description: `${project.sitename}`,
                        code: stripUrl(project.url),
                        dbname: project.dbname,
                    });
                });

                return byFamily;

            }, {
                all: {
                    family: 'all', title: 'All Project Families', projects: [{
                        title: 'All Projects',
                        description: 'Aggregate of all project families',
                        code: 'all-projects',
                        dbname: 'all',
                    }],
                }
            })).map(f => {
                let sorted = f.projects.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);

                if (sorted.length > 1) {
                    sorted.splice(0, 0, {
                        title: 'All Projects',
                        description: `Aggregate of all ${f.title} projects`,
                        code: 'all-projects',
                        dbname: 'all',
                    });
                }

                return Object.assign(f, {
                    projects: sorted
                });
            });
        });
    },
};

/**
 * Retrieves and serves the sitematrix from the Wikimedia REST API.
 */
import _ from '../lodash-custom-bundle';
import config from '../config';

// be-tarask language is the only one whose language
// code differs from its hostname's language prefix.
// This map addresses that issue.
const languageCodeFix = {
    'be-x-old': 'be-tarask'
};

const browserLanguage = (navigator.language || navigator.userLanguage).split('-')[0];
const languageFromStorage = window.localStorage.getItem('language');
const userLanguage = languageFromStorage || browserLanguage;

// The jsonp promise used by all other structures and methods. See:
// https://meta.wikimedia.org/w/api.php?action=sitematrix&formatversion=2
const matrix = $.ajax({
    url: config.sitematrix.endpoint,
    dataType: 'jsonp',
    cache: true,
    headers: {
        "accept-language": userLanguage
    }
});

const siteIsSelectable = (site) => {
    if ('private' in site) return false;
    return true;
}

// Iterates over the sitematrix and creates a data structure
// for easy retrieval of project family data:
//   {
//       wikipedia: {
//           type: 'projectFamily',
//           code: 'wikipedia',
//           name: 'Wikipedia',
//           localName: 'Viquipèdia',
//           wikis: {
//               en: {
//                   dbname: 'enwiki',
//                   hostname: 'en.wikipedia.org'
//               },
//               de: { ... },
//               ...
//           }
//       },
//       wiktionary: { ... },
//       ...
//   }
const projectFamilies = matrix.then(matrixData => {
    return _.transform(matrixData.sitematrix, (projectFamilyAcc, languageGroup, key) => {
        if (key !== 'count' && key !== 'specials') {
            languageGroup.site.forEach(site => {
                if (siteIsSelectable(site)) {
                    const languageCode = languageCodeFix[languageGroup.code] || languageGroup.code;
                    const siteCode = site.code === 'wiki' ? 'wikipedia' : site.code;
                    const wikiInfo = {
                        dbname: site.dbname,
                        hostname: stripUrl(site.url)
                    };
                    let projectFamily = projectFamilyAcc[siteCode];
                    if (projectFamily) {
                        // If the project family has already been parsed for another language,
                        // just add the information for this new language.
                        projectFamily.wikis[languageCode] = wikiInfo;
                    } else {
                        // If this is the first language that features this project family,
                        // Create the whole object and add it to the accumulator.
                        const wikis = {};
                        wikis[languageCode] = wikiInfo;
                        projectFamily = {
                            type: 'projectFamily',
                            code: siteCode,
                            wikis
                        };
                        projectFamilyAcc[siteCode] = projectFamily;
                    }
                    // Populate localName using the language specified by the browser.
                    // Also, if the project family has no name, default it to localname.
                    if (languageCode === userLanguage) {
                        const localName = _.capitalize(site.sitename);
                        projectFamily.localName = localName;
                        if (!projectFamily.name) {
                            projectFamily.name = localName;
                        }
                    }
                    // Populate name using the english language.
                    // Also, if the project family has no localName, default it to name.
                    if (languageCode === 'en') {
                        const name = _.capitalize(site.sitename);
                        projectFamily.name = name;
                        if (!projectFamily.localName) {
                            projectFamily.localName = name;
                        }
                    }
                }
            });
        }
        return projectFamilyAcc;
    }, {});
});

// Iterates over the sitematrix and creates a data structure
// for easy retrieval of language data:
//   {
//       en: {
//           type: 'language',
//           code: 'en',
//           name: 'English',
//           localName: 'Anglès',
//           wikis: {
//               wikipedia: {
//                   dbname: 'enwiki',
//                   hostname: 'en.wikipedia.org'
//               },
//               wiktionary: { ... },
//               ...
//           }
//       },
//       de: { ... },
//       ...
//   }
const languages = matrix.then(matrixData => {
    return _.transform(matrixData.sitematrix, (languageAcc, languageGroup, key) => {
        if (key !== 'count' && key !== 'specials') {
            const validSites = languageGroup.site.filter(siteIsSelectable);
            if (validSites.length > 0) {
                const languageCode = languageCodeFix[languageGroup.code] || languageGroup.code;
                const name = _.capitalize(languageGroup.name);
                const localName = _.capitalize(languageGroup.localname);
                languageAcc[languageCode] = {
                    type: 'language',
                    code: languageCode,
                    name: name || localName,
                    localName: localName || name,
                    wikis: _.reduce(validSites, (wikis, site) => {
                        const siteCode = site.code === 'wiki' ? 'wikipedia' : site.code;
                        wikis[siteCode] = {
                            dbname: site.dbname,
                            hostname: stripUrl(site.url)
                        };
                        return wikis;
                    }, {})
                };
            }
        }
        return languageAcc;
    }, {});
});

// Iterates over the sitematrix and creates a data structure
// for easy retrieval of special wikis data:
//   {
//       commons: {
//           type: 'specialWiki',
//           code: 'commons',
//           name: 'Wikimedia Commons',
//           dbname: 'commonswiki',
//           hostname: 'commons.wikimedia.org'
//       },
//       meta: { ... },
//       ...
//   }
const specials = matrix.then(matrixData => {
    return projectFamilies.then(projectFamilies => {
        return _.sortBy(
            matrixData.sitematrix.specials
                .filter(siteIsSelectable)
                .map(site => {
                    // The wiki's sitename is used as localName for special wikis.
                    // However, some wikis have confusing sitenames, like: www.wikidata.org,
                    // that has the sitename 'Wikipedia'. If a special site has a sitename
                    // that fully matches an existing project family, then it uses the site
                    // code instead of the sitename.
                    const projectFamilyWithSameName = _.find(
                        Object.values(projectFamilies),
                        projectFamily => {
                            return projectFamily.name.toLowerCase() === site.sitename.toLowerCase();
                        }
                    );
                    return {
                        type: 'specialWiki',
                        code: site.code,
                        name: projectFamilyWithSameName ? _.capitalize(site.code) : site.sitename,
                        dbname: site.dbname,
                        hostname: stripUrl(site.url)
                    };
                }),
                'localName'
        );
    });
});

function stripUrl (url) {
    return url.replace(/https:\/\/(www\.)?/, '');
}

// Returns a function (I) => O that receives an API output item I,
// and transforms it to O, as indicated by the format parameter.
// The format parameter is an object with the following structure:
//   {
//       'originalFieldName1': true,
//       'originalFieldName2': 'transformedFieldName',
//       'newFieldName': 'newConstantValue'
//   }
// The format parameter can be used for 3 things:
//   1) Specify presence of a field. To do that, include the
//      field name as an object property with value true.
//   2) Rename a field. To do that, include the desired field
//      name as an object property, its value should be the
//      original field name of the output. Renaming a field
//      ensures its presence.
//   3) Add a new constant property to the output. To do that,
//      include the new property with name and value as you
//      want it to appear in the output. You can override
//      original fields with that.
// If the format parameter is undefined, the output item is
// returned as is, including all its fields.
function formatOutput (format) {
    if (!format) { return (item) => item; }
    return (item) => {
        if (!item) { return; }
        return _.transform(format, (formatted, value, key) => {
            if (item.hasOwnProperty(key) && value === true) {
                formatted[key] = item[key];
            } else if (item.hasOwnProperty(value)) {
                formatted[key] = item[value];
            } else {
                formatted[key] = value;
            }
            return formatted;
        }, {});
    };
}

export default {

    /**
     * Returns
     *  A list of project families sorted by localName.
     *  The format is the same as in const projectFamilies.
     *
     * Parameters
     *  languageCode    If passed, returns the project families
     *                  that have a version for that language only.
     *                  Otherwise, returns all project families.
     *  format          Desired output format. See: formatOutput().
     */
    getProjectFamilies (languageCode, format) {
        return Promise.all([projectFamilies, languages]).then(values => {
            const [projectFamilies, languages] = values;
            let toReturn;
            if (languageCode) {
                const projectFamilyCodes = Object.keys(languages[languageCode].wikis);
                toReturn = _.map(projectFamilyCodes, projectFamilyCode => {
                    return projectFamilies[projectFamilyCode];
                });
            } else {
                toReturn = _.sortBy(Object.values(projectFamilies), 'localName');
            }
            return toReturn.map(formatOutput(format));
        });
    },

    /**
     * Returns
     *  A list of languages sorted by localName.
     *  The format is the same as in const languages.
     *
     * Parameters
     *  projectFamilyCode    If passed, returns the languages that
     *                       have a version for that project family only.
     *                       Otherwise, returns all languages.
     *  format               Desired output format. See: formatOutput().
     */
    getLanguages (projectFamilyCode, format) {
        return Promise.all([projectFamilies, languages]).then(values => {
            const [projectFamilies, languages] = values;
            let toReturn;
            if (projectFamilyCode) {
                const languageCodes = Object.keys(projectFamilies[projectFamilyCode].wikis);
                const wholeFamily = config.wikiGroups.find(g => g.family === projectFamilyCode);
                // We add the search result for the whole project family at the beginning
                toReturn = [wholeFamily].concat(
                    _.map(languageCodes, languageCode => {
                        return languages[languageCode];
                    })
                );
            } else {
                toReturn = _.sortBy(Object.values(languages), 'localName');
            }
            return toReturn.map(formatOutput(format));
        });
    },

    /**
     * Returns
     *  A list of all regular wikis sorted by hostname.
     *  The format is:
     *   {
     *       type: 'regularWiki',
     *       projectFamily: { ...project family object as in const projectFamilies... },
     *       language: { ...language object as in const languages... },
     *       dbname: 'enwiki',
     *       hostname: 'en.wikipedia.org'
     *   }
     *
     * Parameters
     *  format      Desired output format. See: formatOutput().
     */
    getRegularWikis (format) {
        return Promise.all([projectFamilies, languages]).then(values => {
            const [projectFamilies, languages] = values;
            return _.sortBy(
                _.transform(projectFamilies, (wikiAcc, projectFamily) => {
                    Object.entries(projectFamily.wikis).forEach(values => {
                        const [languageCode, wikiInfo] = values;
                        const language = languages[languageCode];
                        wikiAcc.push({
                            type: 'regularWiki',
                            projectFamily,
                            language,
                            dbname: wikiInfo.dbname,
                            hostname: wikiInfo.hostname
                        });
                    });
                    return wikiAcc;
                }, []),
                'hostname'
            ).map(formatOutput(format));
        });
    },

    /**
     * Returns
     *  A list of all special wikis sorted by localName.
     *  The format is the same as in const specials.
     *
     * Parameters
     *  format          Desired output format. See: formatOutput().
     */
    getSpecialWikis (format) {
        return specials.then(specials => {
            return specials.map(formatOutput(format));
        });
    },

    /**
     * Returns
     *  A list of all wiki groups sorted by localName.
     *  The format is the same as in const wikiGroups.
     *
     * Parameters
     *  format      Desired output format. See: formatOutput().
     */
    getWikiGroups (format) {
        return Promise.resolve(
            config.wikiGroups.map(formatOutput(format))
        );
    },

    /**
     * Returns
     *  An object containing information about the corresponding wiki,
     *  given a project family and a language.
     *
     * Parameters
     *  projectFamilyCode    Code of the requested project family.
     *  languageCode         Code of the requested language.
     *  format               Desired output format. See: formatOutput().
     *
     * Format
     *  {
     *      type: 'regularWiki',
     *      projectFamily: { ...project family object as in const projectFamilies... },
     *      language: { ...language object as in const languages... },
     *      dbname: 'enwiki',
     *      hostname: 'en.wikipedia.org'
     *  }
     */
    getRegularWikiFromProjectFamilyAndLanguage (projectFamilyCode, languageCode, format) {
        return Promise.all([projectFamilies, languages]).then(values => {
            const [projectFamilies, languages] = values;
            const projectFamily = projectFamilies[projectFamilyCode];
            const language = languages[languageCode];
            const wikiInfo = projectFamily.wikis[languageCode];
            return formatOutput(format)({
                type: 'regularWiki',
                projectFamily,
                language,
                dbname: wikiInfo.dbname,
                hostname: wikiInfo.hostname
            });
        });
    },

    /**
     * Returns
     *  An object containing information about the corresponding wiki/group,
     *  given a hostname/code. The format will depend on the returned wiki type.
     *  For regular wikis, see getRegularWikiFromProjectFamilyAndLanguage format;
     *  for special wikis see specials format; for wiki groups see wikiGroups format.
     *
     * Parameters
     *  hostnameOrCode    Hostname/code of the requested wiki/group.
     *  format            Desired output format. See: formatOutput().
     */
    getWikiOrGroupFromHostname (hostnameOrCode, format) {
        return Promise.all([projectFamilies, languages, specials]).then(values => {
            const [projectFamilies, languages, specials] = values;
            const splitHostname = hostnameOrCode.split('.');
            if (splitHostname.length === 3) {
                // If hostname has 3 parts, try to match them
                // to language and project family codes.
                const language = languages[splitHostname[0]];
                const projectFamily = projectFamilies[splitHostname[1]];
                if (language && projectFamily) {
                    return this.getRegularWikiFromProjectFamilyAndLanguage(
                        projectFamily.code, language.code, format);
                }
            }
            // Otherwise, try to find the whole hostname within wiki groups or special wikis.
            return formatOutput(format)(
                _.find(config.wikiGroups, group => group.code === hostnameOrCode) ||
                _.find(specials, wiki => wiki.hostname === hostnameOrCode)
            );
        });
    }
};

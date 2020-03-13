#!/usr/bin/env node

const prodConfig = require('./prod.config');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distPath = `${__dirname}/../dist`;
const i18nSrcPath = `${__dirname}/../src/i18n`;

const timei18nPath = path.join(__dirname, '../node_modules/date-fns/locale');
const availableTimeLocales = new Set(fs.readdirSync(timei18nPath));
const version = require("../package.json").version;
const configLanguages = require("../package.json").languages;

const deleteFolderRecursive = function(pathToDir) {
  if (fs.existsSync(pathToDir)) {
    fs.readdirSync(pathToDir).forEach((file, index) => {
      const curPath = pathToDir + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToDir);
  }
};

const getLocalesToBuild = () => {
    let availableLocales = fs.readdirSync(i18nSrcPath).map(file => file.replace('.json', ''));
    const languagesIndex = process.argv.indexOf('languages');
    if (languagesIndex > -1) {
        const languages = process.argv[languagesIndex + 1].split(',');
        availableLocales = availableLocales.filter(loc => languages.includes(loc));
    } else {
        availableLocales = availableLocales.filter(loc => configLanguages.includes(loc));
    }
    return availableLocales
}

/**
    Instead of passing a list of configurations, each with a different
    language, we generate an initial build, get the contents of the
    initial build file, and manually inject the locales with a template.
**/

const applyLanguageToBundle = (locale, bundle) => {
    const timeLocaleName = availableTimeLocales.has(locale) ? locale : 'en-US';
    const userMessages = JSON.stringify(require(`${i18nSrcPath}/${locale}.json`));
    const timeLocale = JSON.stringify(require(`../node_modules/date-fns/locale/${timeLocaleName}`))
    const fullFile = `userMessages=${userMessages};timeLocale=${timeLocale};${bundle}`;
    fs.writeFileSync(`${distPath}/main.bundle.${version}.${locale}.js`, fullFile, function (err) {
        if (err) {
            console.log(`An error occured while writing ${locale} locale to file.`);
            console.error(err);
        }
    });
}

const moveAssetsToV2Dir = () => {
    const v2Path = `${distPath}/assets-v2`;
    if (!fs.existsSync(v2Path)) {
        fs.mkdirSync(v2Path);
    }
    fs.readdirSync(distPath)
        .filter(item => item !== 'index.html' && item !== 'assets-v2')
        .forEach(item => {
            fs.renameSync(`${distPath}/${item}`, `${v2Path}/${item}`)
        })
    ;
}

deleteFolderRecursive(distPath);

const locales = getLocalesToBuild();
console.info(`Building languages ${locales.join(', ')}`);
const config = _.cloneDeep(prodConfig);

// Probably move all of this to production config
config.plugins.push(
    new webpack.DefinePlugin({
        AVAILABLE_LANGUAGES: JSON.stringify(locales)
    }),
    new HtmlWebpackPlugin({
        filename: 'index.html',
        favicon: 'src/assets/analytics.png',
        template: 'src/index.ejs',
        inject: false,
        availableLocales: locales
    })
);
config.output.filename = `main.bundle.${version}.en.js`;

webpack(config, (err, stats) => {
    console.log(stats);
    if (err || stats.hasErrors()) {
        console.error(stats.toJson().errors);
    } else {
        const initialBundle = fs.readFileSync(`${distPath}/${config.output.filename}`);
        locales.forEach(locale => {
            console.log(`Generating ${locale} build`);
            applyLanguageToBundle(locale, initialBundle);
        });
        moveAssetsToV2Dir();
    }
});

#!/usr/bin/env node

const prodConfig = require('./prod.config');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
const distPath = `${__dirname}/../dist`;

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
    const i18ndir = path.join(__dirname, '../src/i18n/');
    let availableLocales = fs.readdirSync(i18ndir).map(file => file.replace('.json', ''));
    const languagesIndex = process.argv.indexOf('languages');
    if (languagesIndex > -1) {
        const languages = process.argv[languagesIndex + 1].split(',');
        availableLocales = availableLocales.filter(loc => languages.includes(loc));
    }
    return availableLocales
}

deleteFolderRecursive(distPath);

const configs = [];
const locales = getLocalesToBuild();
console.info(`Building locales ${locales.join(', ')}`);
locales.forEach(locale => {
    const config = _.cloneDeep(prodConfig);
    const timei18ndir = path.join(__dirname, '../node_modules/date-fns/locale');
    const availableTimeLocales = new Set(fs.readdirSync(timei18ndir));
    const timeLocale = availableTimeLocales.has(locale) ? locale : 'en-US';
    config.plugins.push(
        new webpack.ProvidePlugin({
            timeLocale: path.join(__dirname, `../node_modules/date-fns/locale/${timeLocale}`),
            userMessages: path.join(__dirname, `../src/i18n/${locale}.json`)
        }),
        new webpack.DefinePlugin({
            AVAILABLE_LANGUAGES: JSON.stringify(locales)
        })
    );
    const version = require("../package.json").version;
    config.output.filename = `[name].bundle.${version}.${locale}.js`;
    configs.push(config);
});

webpack(configs, (err, stats) => {
    console.log(stats);
    if (err || stats.hasErrors()) {
        console.error(stats.toJson().errors);
    } else {
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
});

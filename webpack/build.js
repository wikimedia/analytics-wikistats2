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

deleteFolderRecursive(distPath);

const configs = [];
const i18ndir = path.join(__dirname, '../src/i18n/');
const availableLocales = fs.readdirSync(i18ndir).map(file => file.replace('.json', ''));
const timei18ndir = path.join(__dirname, '../node_modules/date-fns/locale');
const availableTimeLocales = new Set(fs.readdirSync(timei18ndir));
availableLocales.forEach(locale => {
    const config = _.cloneDeep(prodConfig);
    const timeLocale = availableTimeLocales.has(locale) ? locale : 'en-US';
    config.plugins.push(
        new webpack.ProvidePlugin({
            timeLocale: path.join(__dirname, `../node_modules/date-fns/locale/${timeLocale}`),
            userMessages: path.join(__dirname, `../src/i18n/${locale}.json`)
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

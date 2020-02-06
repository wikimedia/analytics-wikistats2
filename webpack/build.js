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

webpack(prodConfig, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err);
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
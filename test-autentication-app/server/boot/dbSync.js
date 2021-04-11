'use strict';
const fs = require('fs');
const path = require('path');

const extractDataSourceModels = (modelConfigPath, dataSourceName, callback) => {
  console.log('Extracting models from config file:');
  fs.readFile(modelConfigPath, (err, data) => {
    if (err) return callback(err);
    const models = JSON.parse(data.toString('utf8'));
    const modelKeys = Object.keys(models);
    const modelKeysL = modelKeys.length;
    const datasourceModels = [];
    for (let i = 0; i < modelKeysL; i++) {
      const currKey = modelKeys[i];
      if (currKey !== '_meta') {
        const model = models[currKey];
        const currDatasource = model.dataSource;
        if (currDatasource === dataSourceName) datasourceModels.push(currKey);
      }
    }
    return callback(null, datasourceModels);
  });
};

const autoSyncDatasource = (dataSource, callback) => {
  console.log('Syncing database: ');
  const dataSourceName = dataSource.name;
  // eslint-disable-next-line max-len
  const modelConfigPath = path.join(process.cwd(), 'server', 'model-config.json');

  // extract the model's array
  // eslint-disable-next-line max-len
  extractDataSourceModels(modelConfigPath, dataSourceName, (err, datasourceModels) => {
    if (err) return console.error(err);
    console.log(datasourceModels);
    dataSource.isActual(datasourceModels, (err, actual) => {
      if (err) return console.err(err);
      if (actual) {
        console.log('Remote source is actual, no need to sync models');
        return callback();
      }
      console.log('Remote source is not actual, syncing');
      dataSource.autoupdate(datasourceModels, (err, result) => {
        if (err) return console.log('Error: ', err);
        console.log('DB synced successfully');
        return callback();
      });
    });
  });
};

module.exports = function(app, cb) {
  const dataSourceMysql = app.datasources.mysqlDs;
  autoSyncDatasource(dataSourceMysql, cb);
};

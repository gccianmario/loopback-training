// Copyright IBM Corp. 2014,2019. All Rights Reserved.
// Node module: loopback-getting-started

'use strict';

const autoSyncDs = (dataSource, cb) =>{
  console.log('*** Syncing database ***');
  dataSource.isActual( 'CoffeeShop', (err, actual) =>{
    if (err) return console.err(err);
    if (actual) {
      console.log('*** Remote source is actual, no need to sync models ***');
      return cb();
    }

    console.log('*** Remote source is not actual, syncing ***');

    dataSource.autoupdate('CoffeeShop', (err, result) => {
      if (err) return console.log('Error: ', err);
      console.log('*** DB synced successfully ***');
      return cb();
    });
  });
};

module.exports = function(app, cb) {
  /*
  async needed on top
  script for mongo
  await app.dataSources.mongoDs.automigrate('CoffeeShop');
  const coffeeShops = await app.models.CoffeeShop.create([{
    name: 'Bel Cafe',
    city: 'Vancouver',
  }, {
    name: 'Three Bees Coffee House',
    city: 'San Mateo',
  }, {
    name: 'Caffe Artigiano',
    city: 'Vancouver',
  },
  ]);

  console.log('Models created: \n', coffeeShops);
  */

  autoSyncDs(app.dataSources.mysqlDs, cb);
};

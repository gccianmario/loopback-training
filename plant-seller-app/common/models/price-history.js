'use strict';

module.exports = function(Pricehistory) {
  const app = require("../../server/server");

  /* this has been developed using scope
  Pricehistory.withSpecies = async function() {
    return app.models.PriceHistory.find({
      include: {
        relation: "specie"
      }
    })
  } */

  Pricehistory.remoteMethod('withSpecies', {
    returns: {arg: 'data', type: 'object'},
  });
};

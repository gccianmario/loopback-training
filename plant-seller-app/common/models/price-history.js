'use strict';

module.exports = function(Pricehistory) {
  const app = require("../../server/server");

  Pricehistory.withSpecies = async function() {
    return app.models.PriceHistory.find({
      include: {
        relation: "specie"
      }
    })
  }

  Pricehistory.remoteMethod('withSpecies', {
    returns: {arg: 'data', type: 'object'},
  });
};

'use strict';

module.exports = function(Client) {
  const app = require("../../server/server");

  Client.observe("before delete", async (ctx) => {
    console.log("id of client.. "+ ctx.where.id)
    const purchaseList = await app.models.Purchase.find(
      {
        where: {client_id: ctx.where.id}
      }
    )
    if (await purchaseList.length !== 0)
      throw new Error(`client has ${await purchaseList.length} purchase associated=>cannot be deleted`)
  })
};

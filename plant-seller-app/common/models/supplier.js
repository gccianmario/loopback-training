'use strict';

module.exports = function(Supplier) {
  const app = require("../../server/server");

  const verifyIfSupplierCanBeDeleted = (supplier_id) =>{
    return new Promise((resolve,reject) => {
      //find species supplied by this supplier if any
      return app.models.Specie.find({
        where:{
          supplier_id: supplier_id
        }
      }).then((suppliedSpecies)=>{
        if(suppliedSpecies.length === 0)
          resolve(true)
        const specieNames = suppliedSpecies.map(s=>s.id)
        //search if any purchase involves any species supplied by this supplier
        return app.models.Purchase.find({
          where:{
            specie_id : { inq: specieNames}
          }
        }).then((listOfAllPurchases)=>{
          resolve(listOfAllPurchases.length === 0)
        })//.catch(err=>console.log("purchase find error cannot delete " + err))
      }).catch(err=>{
        console.log("specie find error cannot delete " + err)
        reject(err)
      })
    })
  }

  Supplier.observe("before delete", async (ctx) => {
    const res = await verifyIfSupplierCanBeDeleted(ctx.where.ssn)
    if (!res) throw new Error("supplier cannot be deleted, it is involved in transactions");
  })
};

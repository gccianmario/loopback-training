'use strict';
const fetch = require('node-fetch');
const slugify = require('slugify')

const fetchSpecie = async (plantName) => {
  //oRvJ1giZ198MMpbTr12kEbWj7PRCmaqPVn46ChqLNLs
  const rawData = await fetch(`https://trefle.io/api/v1/plants?token=oRvJ1giZ198MMpbTr12kEbWj7PRCmaqPVn46ChqLNLs&filter%5Bcommon_name%5D=${plantName}`)
    .catch(e=> console.log("error fetching plant data " + e))
  const dataJson = await rawData.json()
  return await dataJson.data
}

module.exports = function(Specie) {
  const app = require("../../server/server");

  //*********************** operation hooks ********************
  Specie.observe("after save", async (ctx) => {
    if (ctx.isNewInstance) {
      const plantName = ctx.instance.commonName
      fetchSpecie(plantName).then((data) => {
        if (data !== undefined) {
          const plantObj = data[0]
          if(plantObj.scientific_name !== undefined && plantObj.slug !== undefined){
            ctx.instance.updateAttribute("slug", plantObj.slug);
            ctx.instance.updateAttribute("latinName", plantObj.scientific_name);
          }
          else
            throw new Error("slug or scientific name undefined in dataset")
        } else
          throw new Error("plant specie undefined in dataset")
      }).catch(err => {
        ctx.instance.slug = slugify(ctx.instance.commonName)
        console.log(err + 'common name used as a slug')
      }).catch(err => console.log("after save error of specie " + err))

    }
    return
  })

  //*********************** remote method's functions ********************
  Specie.coloredWith = async function(color) {
    const res = await app.models.Specie.find({
      where: {
        colors: {
          like: `%${color}%`
        }
      }
    })
    //add custom logic to remove leak of precision of the "like"
    //console.log(await res.length)
    return res
  }
  Specie.purpleSpeciesPriceHistories = async function() {
    const res = await app.models.Specie.find({
      where: {
        colors: {
          like: `%purple%`
        }
      },
      include: {
        relation: "priceHistories"
      }
    })
    //add custom logic to remove leak of precision of the "like"
    console.log(await res.length)
    //add custom logic to better organize the data, a json with all the single prices can be made if needed
    return res
  }
  Specie.allColors = async function(){
    const final =  await app.models.Specie.find().then((plants)=>{
      let res = new Set()
      plants.forEach((p)=>{
        if(p.colors !== undefined){
          p.colors.forEach(color=>{
            res.add(color)
          })
        }
      })
      return res
    })
    //console.log(await final)
   return [...final]
  }

  //*********************** remote method ********************
  Specie.remoteMethod('coloredWith', {
    accepts: {arg: 'color', type: 'string'},
    returns: {arg: 'data', type: 'object'}
  });
  Specie.remoteMethod('allColors', {
    returns: {arg: 'data', type: 'object'}
  });
  Specie.remoteMethod('purpleSpeciesPriceHistories', {
    returns: {arg: 'data', type: 'object'}
  });
};

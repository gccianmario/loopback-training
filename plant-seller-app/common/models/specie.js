'use strict';
const fetch = require('node-fetch');
const slugify = require('slugify')

const fetchSpecie = async (plantName) => {
  //oRvJ1giZ198MMpbTr12kEbWj7PRCmaqPVn46ChqLNLs
  const rawData = await fetch(`https://trefle.io/api/v1/plants?token=oRvJ1giZ198MMpbTr12kEbWj7PRCmaqPVn46ChqLNLs&filter%5Bcommon_name%5D=${plantName}`)
    .catch(e=> console.log("error fetching plant data " + e))
  const dataJson = (await rawData).json()
  console.log(dataJson)
  return dataJson.data
}

module.exports = function(Specie) {
  const app = require("../../server/server");

  //*********************** operation hooks ********************
  Specie.observe("after save", async (ctx) => {
    if (ctx.isNewInstance) {
      const plantName = ctx.instance.commonName

      await fetchSpecie(plantName).then(async (data) => {
        if (data) {
          const plantObj = data[0]
          if(plantObj.scientific_name  && plantObj.slug ){
            //!! this triggers a new save ##
            await ctx.instance.updateAttributes({"slug": plantObj.slug, "latinName": plantObj.scientific_name})
            /*
            ctx.instance.updateAttribute("slug", plantObj.slug);
            ctx.instance.updateAttribute("latinName", plantObj.scientific_name);
            */
          }
          else
            throw new Error("slug or scientific name undefined in dataset")
        } else
          throw new Error("plant specie undefined in dataset")
      }).catch(async err => {
        const defaultSlug = slugify(ctx.instance.commonName)
        await ctx.instance.updateAttribute("slug", defaultSlug);
        //console.log(err + 'common name used as a slug')
      })

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
    //add custom logic to remove leak of precision of the "like" if needed
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
      include: "priceHistories"
    })
    //add custom logic to remove leak of precision of the "like"
    //console.log(await res.length)
    //add custom logic to better organize the data, a json with all the single prices can be made if needed
    return res
  }
  Specie.allColors = async function(){
    return app.models.Specie.find().then((plants)=>{
      let res = new Set()
      plants.forEach((p)=>{
        if(p.colors !== undefined){
          p.colors.forEach(color=>{
            res.add(color)
          })
        }
      })
      return [...res]
    })
  }
  Specie.image = async function(id){
    console.log("into remote....")
    const plant = await app.models.Specie.findById(id)
    //console.log(await plant)
    if(!plant)  //remove
      return "https://c8.alamy.com/comp/2A4C5J3/oops-404-page-interface-design-with-plant-vector-illustration-vector-2A4C5J3.jpg"

    const plantData = await fetchSpecie(plant.commonName)
    if(plantData.length === 0 || !plantData[0].image_url)
      return "https://c8.alamy.com/comp/2A4C5J3/oops-404-page-interface-design-with-plant-vector-illustration-vector-2A4C5J3.jpg"

    return plantData[0].image_url

  }

  //*********************** remote methods ********************
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
  Specie.remoteMethod('image', {
    //add http to cusotm hook in DRIVER CandGo
    //in post you have to use body
    accepts: {arg: 'id', type: 'string',required: true},
    returns: {arg: 'data', type: 'object'},
    http:{path: "/image", verb: "get"}
  });

  //*********************** remote hooks ********************
  Specie.beforeRemote('image', (ctx,unused,next)=>{
    console.log("before-remote ***")
    //verify is the slug is form api or generated with common name
    next()
  })
};

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

  //*********************** remote methods ********************
  Specie.greet = async function(msg) {
    return 'Greetings... ' + msg;
  }

  Specie.remoteMethod('greet', {
    accepts: {arg: 'msg', type: 'string'},
    returns: {arg: 'greeting', type: 'string'}
  });
};

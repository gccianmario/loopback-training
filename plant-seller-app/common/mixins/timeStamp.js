'use strict';

module.exports = function(Model, options) {
  // Model is the model class
  // options is an object containing the config properties from model definition
  Model.defineProperty('created', {type: String});
  Model.defineProperty('modified', {type: String});

  Model.observe('after save', (ctx, next)=>{
    const d = new Date()
    const timestamp = `${d.getFullYear()}/${d.getMonth()}/${d.getDate()}-${d.getHours()}:${d.getMinutes()}`
    //va bene? c'è il bug che se modifico nello stesso minuto non viene segnata
    if(ctx.isNewInstance)
      ctx.instance.updateAttribute("created", timestamp)
    else if(ctx.instance.created !== timestamp && ctx.instance.modified !== timestamp)
      ctx.instance.updateAttribute("modified", timestamp)

    next();
  });


  /*
  ADD THIS IN THE MODELS TARGET OF THE MIXINS
     "mixins": {
     "Timestamp": {
       "myOption": 1,
       "anotherOpt": 2
     }
   }*/
};

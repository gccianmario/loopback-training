
const autoSyncDs = (dataSource, cb) =>{
  dataSource.isActual(['School', 'Classroom','Student', 'Lecture'], (err, actual)=>{
    if(err) return console.err(err);
    if(actual){
      return cb();
    }

    dataSource.autoupdate(['School', 'Classroom','Student', 'Lecture'], (err, actual)=>{
      if (err) return console.log('Error: ', err);
      return cb();
    })
  })
};
module.exports = function(app, cb){
  autoSyncDs(app.dataSources.mysqlDs, cb);
};

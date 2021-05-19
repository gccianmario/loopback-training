'use strict';

module.exports = function(Employee) {
  const app = require("../../server/server");

  Employee.observe("after save", async (ctx) => {

    if (ctx.isNewInstance) {
      console.log('## saved employee %s with id: %s as %s', ctx.instance.name, ctx.instance.id, ctx.instance.userType);
      const roleName = ctx.instance.userType

      //find role associated to the new instance
      const role = await app.models.Role.findOne({
        where: {
          name: roleName,
        },
      })//.catch(e=>console.log("unable to find role" + e))

      if(role){
        //crate association in the role mapping among employee.id and his role
        //console.log(role)
        await role.principals.create({
          principalType: app.models.RoleMapping.USER,
          principalId: ctx.instance.id,
        })//.catch(e=>console.log("unable to create role-id association" + e))
      }
      else{
        //handle this case ##
        //and the cases where the user has to be deleted
        //this can be fine without doing anything the user will match no role
        console.log("(not a catch) Unable to match this role")
      }

    } else {
      console.log("(not a catch) logic if an update occurs..")
    }
  })
    return
};

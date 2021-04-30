'use strict';

module.exports = function(Employee) {
  const app = require("../../server/server");

  Employee.observe("after save", async (ctx) => {

    if (ctx.isNewInstance) {
      console.log('## saved employee %s with id: %s as %s', ctx.instance.name, ctx.instance.id, ctx.instance.userType);
      const roleName = ctx.instance.userType

      //find role associated to the new instance
      const role = await app.models.Role.find({
        where: {
          name: roleName,
        },
      }).catch(e=>console.log("unable to find role" + e))

      if(role.length !== 0){
        //crate association in the role mapping among employee.id and his role
        //console.log(role)
        await role[0].principals.create({
          principalType: app.models.RoleMapping.USER,
          principalId: ctx.instance.id,
        }).catch(e=>console.log("unable to create role-id association" + e))
      }
      else console.log("(not a catch) Unable to match this role")


    } else {
      console.log("(not a catch) logic if an update occurs..")
    }
  })

  // Employee.aCaso = async (a,b,c) => {return a.toString()}
};

'use strict';

module.exports = (app, cb) => {
  const User = app.models.User;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;

  //assumption that the order of the user is matched below with his/her role
  const usersDefault = [
    {username: 'John Boss', email: 'john@doe.com', password: '1234'},
    {username: 'Jane Vuoi Una Busta', email: 'jane@doe.com', password: 'aaa'},
    {username: 'Kevin Non Guardo Il Codice', email: 'kevin@doe.com', password: '11aaa'},
    {username: 'Bob Magasin', email: 'bob@projects.com', password: 'aaa'},
    {username: 'Giggi Forklift', email: 'giggi@projects.com', password: 'weaa'},
    {username: 'Gian', email: 'gian@projects.com', password: '12345'},
  ];
  const rolesDefault = [
    {name: 'manager'},
    {name: 'cashier'},
    {name: 'cashier'},
    {name: 'warehouse worker'},
    {name: 'warehouse worker'},
    {name: 'superadmin'},
  ];


  //****************** aux functions ****************************
  const createUser = async(name, email, password) => {
    const userObj = {username: name, email: email, password: password}
    return User.create(userObj)
  }
  const createUserFromObj = async(userObj) => {
    return User.create(userObj)
  }
  const createRole = async(roleName) => {
    return Role.create({
      name: roleName,
    });
  };
  const roleExists = async(roleName) => {
    const res = await Role.find({
      where: {
        name: roleName,
      },
    });
    //console.log(res)
    return res.length !== 0;
  };
  const roleExists2 = async(roleName) => {
    return Role.find({
      where: {
        name: roleName,
      },
    });
  };
  const assignRoleToUser = async(roleName, user) => {
    //console.log(user)
    return roleName.principals.create({
      principalType: RoleMapping.USER,
      principalId: user.id,
    })
  }
  const roleAttached = async(roleName, user) => {
    const res = await roleName.principals.find({
      principalType: RoleMapping.USER,
      principalId: user.id,
      roleId: roleName.id,
    })
    return res.length !== 0
  }
  const createUserIfNull = async(userObj) => {
    return User.findOrCreate({
      where: {
        email: userObj.email
      }
    },userObj)
  }
  const createRoleIfNull = async(roleObj) => {
    return Role.findOrCreate({
      where: {
        name: roleObj.name
      }
    }, roleObj);
    /*
    return roleExists(roleObj.name).then((exist)=>{
      if(exist)
        return Role.find({
          where:{
            name: roleObj.name
          }
        }).catch(err=>console.log("role find error " + err))
      else return Role.create(roleObj)
    }).catch(err=>console.log("role exist check error " + err))*/
  }
  //**************************************************************


  // procedure that assign at the n-th user the n-th role within the default
  // lists, each role or user not existing is created otherwise found and extracted

  usersDefault.forEach((userObj,i) => {
    createUserIfNull(userObj)
      .then((user)=>{
        //console.log(user[0])
        createRoleIfNull(rolesDefault[i])
          .then((role)=>{
            roleAttached(role[0],user[0])
              .then((isRoleAttached)=>{
                if(!isRoleAttached)
                  //core point of assignment
                  assignRoleToUser(role[0], user[0])
                  .catch(e=>console.log("role assign error " +e))
              }).catch(e=>console.log("role attached check error" + e))
          }).catch(e=>console.log("role creation-if-null error " +e))
      }).catch((err)=>console.log("user research/creation error" + err))
  })

  return cb()

  // failures before reaching the goal...

  /* //the long way for roles
rolesDefault.forEach((roleName)=>{
  roleExists(roleName).then((res) => {
    if (!res)
      createRole(roleName).catch((err) => console.log("role creation error"))
  })
})*/

  /*/create default users
  usersDefault.forEach((userObj) => {
    createUserIfNull(userObj)
      .catch((err)=>console.log("user research/cration error" + err))
  })//*/

  /*/create default roles and assign them to default users
  rolesDefault.forEach((roleObj,i)=>{
    createRoleIfNull(roleObj)
      .then((role)=>{
        roleAttached(role[0],usersDefault[i])
          .then((isRoleAttached)=>{
            if(!isRoleAttached)
              assignRoleToUser(role[0], usersDefault[i]).catch(e=>console.log("role assign error " +e))
          }).catch(e=>console.log("role attached check error" + e))
        assignRoleToUser(role[0], usersDefault[i]).catch(e=>console.log("role assign error " +e))
      }).catch(e=>console.log("role creation if null error " +e))
  })//*/

  /*  create default roles with callback
  rolesDefault.forEach((roleName,i)=> {
    Role.findOrCreate({
      where: {
        name: roleName.name,
      }
    }, roleName, (err, role) => {
      if (err) throw err;
      role.principals.create({
        principalType: RoleMapping.USER,
        principalId: usersDefault[i].id
      }, function(err, principal) {
        if (err) throw err;
      })
    })
  })

  /*
  rolesDefault.forEach((roleName,i)=>{
    createRoleIfNull(roleName)
      .then((role) =>{assignRoleToUser(role,usersDefault[i])
        .catch(err=>console.log("role -> user assignment error" + err))})
      .catch((err)=>console.log("role creation error" + err))
  })


  /*
  Role.create({
    name: 'admin'
  }, function(err, role) {
    if (err) cb(err);

    console.log(role)
    //make bob an admin
    role.principals.create({
      principalType: RoleMapping.USER,
      principalId: usersDefault[1].id
    }, function(err, principal) {
      cb(err);
    });
  });

   */

  /* assign default roles to default users
    usersDefault.forEach((user, i)=>{
      roleAttached(rolesDefault[i], user)
        .then((res)=>{
          if(!res)
            assignRoleToUser(rolesDefault[i].name,user)
              .catch((err)=>console.log("user <- role assignment error + err"))
        })
        .catch((err)=>console.log("checking role attached error" + err))
    })
  //*/

}

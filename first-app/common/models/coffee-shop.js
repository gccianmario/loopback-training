'use strict';

// In LoopBack, a Node function attached to a custom REST endpoint is called a remote method.

module.exports = function(CoffeeShop) {
  // CoffeeShop.NameOfTheNewRoot
  CoffeeShop.status = function(cb) {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const OPEN_HOUR = 6;
    const CLOSE_HOUR = 20;
    console.log('Current hour is %d', currentHour);
    let response;
    if (currentHour >= OPEN_HOUR && currentHour < CLOSE_HOUR) {
      response = 'We are open for business.';
    } else {
      response = 'Sorry, we are closed. Open daily from 6am to 8pm.';
    }
    cb(null, response);
  };

  CoffeeShop.getName = function(shopId, cb) {
    CoffeeShop.findById(shopId, function(err, instance) {
      let response = `Name of coffee shop is ${instance.name}`;
      cb(null, response);
      console.log(response);
    });
  };

  // LoopBack models have a remoteMethod() static method that you use to register a remote method:
  // 1 call for each new root should be made
  // doc here https://loopback.io/doc/en/lb3/Remote-methods

  CoffeeShop.remoteMethod(
    'getName',
    {
      http: {
        path: '/getname',
        verb: 'get',
      },
      accepts: {
        arg: 'id',
        type: 'number',
        required: true,
        http: {
          source: 'query',
        },
      },
      returns: {
        arg: 'name',
        type: 'string',
      },
    }
  );

  CoffeeShop.remoteMethod(
    'status', {
      http: {
        path: '/status',
        verb: 'get',
      },
      returns: {
        arg: 'status',
        type: 'string',
      },
    }
  );
};

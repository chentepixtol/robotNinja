
var Robot = function(robot) {
};

(function() {

  var pi = 3.141592;

  var Geometry = {
    toRadians: function(degrees) {
      return degrees * ( pi / 180 );
    },
    toDegrees: function(radians) {
      return radians * ( 180 / pi );
    },
    getCuadrant: function(x, y, cx, cy) {
      return x < cx ? (y < cy ? 1 : 3) : (y < cy ? 2 : 4);
    },
    calculateAngle: function(x, y, cx, cy, adjust) {
      if (adjust == undefined) {
        adjust = true;
      }
      var angle = Math.abs(this.toDegrees(Math.asin(Math.abs(cx - x) / this.calculateHypontenus(x, y, cx, cy))));
      if (adjust) {
        var quad = this.getCuadrant(x,y,cx,cy);
        if (1 == quad) {
          angle = 180 - angle;
        } else if (2 == quad) {
          angle = 180 + angle;
        } else if (4 == quad) {
          angle = 360 - angle;
        }
      }
      return Math.floor(angle);
    },
    calculateHypontenus: function(x, y, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));
    },
  };

  var Arena = {
    center: {
      x: null,
      y: null,
    },
    getCenter: function(robot) {
      if (!this.center.x) {
        this.center.x = Math.floor(robot.arenaWidth / 2);
        this.center.y = Math.floor(robot.arenaHeight / 2);
      }
      return this.center;
    },
    moveToXY: function(robot, x, y) {
      var angle = Geometry.calculateAngle(robot.position.x, robot.position.y, x, y) - robot.angle;
      robot.turn(angle);
      robot.ahead(Geometry.calculateHypontenus(robot.position.x, robot.position.y, x, y));
    },
    moveToCenter: function(robot) {
      this.getCenter(robot);
      this.moveToXY(robot, this.center.x, this.center.y);
      Event.trigger('onCenter', {
        robot: robot,
      });
    },
  };

  function composite(functions){
    return function() {
      var args = Array.prototype.slice.call(arguments, 0);
      var response = [];
      functions.forEach(function(fn) {
        response.push(fn.apply(fn, args));
      });
      return response;
    };
  }

  var Event = {
    events: {},
    on: function(eventName, callback) {
      if (this.events[eventName]) {
        this.events[eventName].push(callback);
      } else {
        this.events[eventName] = [callback];
      }
    },
    trigger: function(eventName, options) {
      if (this.events[eventName]) {
        return composite(this.events[eventName]).call(this, options);
      }
      return [];
    }
  };

  var RobotExt = {
    fireToXY: function(robot, x, y) {
      var angle = Geometry.calculateAngle(robot.position.x, robot.position.y, x, y, true);
      this.turnCannon(robot, 90 + angle - robot.cannonAbsoluteAngle);
    },
    turnCannon: function(robot, angle) {
      if (angle == 360 || angle == 0) {
        return;
      }
      var side = '';
      if ( angle > 0 ) {
        if (angle < 180) {
          side = 'Right';
        } else if (angle > 180 && angle < 360) {
          side = 'Left';
          angle = angle - 180;
        } else if (angle > 360) {
          return this.turnCannon(robot, angle - 360);
        }
        if (robot['turnGun' + side]) {
          robot['turnGun' + side](angle);
        }
      } else if (angle < 0) {
        if (angle > -180) {
          side = 'Right';
        } else if (angle < -180 && angle > -360) {
          side = 'Left';
          angle = angle + 180;
        } else if (angle < -360) {
          return this.turnCannon(robot, angle + 360);
        }
        if (robot['turnGun' + side]) {
          robot['turnGun' + side](angle);
        }
      }
    }
  };

  var Strategy  = {
    events: {},
    get: function(name) {
      return this.events[name] ? composite(this.events[name]) : function(){};
    },
    add: function(name, callback, context) {
      if (/^on[a-z]+/i.test(name) && typeof callback === 'function') {
        if (this.events[name]) {
          this.events[name].push(callback.bind(context));
        } else {
          this.events[name] = [callback.bind(context)];
        }
      }
    },
    append: function(object) {
      for(var property in object){
        this.add(property, object[property], object);
      }
    },
    replace: function(object) {
      delete this.events;
      this.events = {}
      for(var property in object){
        this.add(property, object[property], object);
      }
    },
  };

  var MoveToCenterStrategy = {
    onIdle: function(ev) {
      Arena.moveToCenter(ev.robot);
    }
  };

  var SeekerStrategy = {
    enemy: null,
    onIdle: function(ev) {
      var robot = ev.robot;
      robot.rotateCannon(3);
    },
    onScannedRobot: function(ev) {
      ev.robot.log("onSeek");
      Event.trigger('onSeek', {
        enemy: ev.scannedRobot,
      });
    }
  };

  var AttackStrategy = {
    enemy: null,
    setOptions: function(options) {
      this.enemy = options.enemy;
    },
    onIdle: function(ev) {
      var robot = ev.robot;
      robot.turn(4);
      robot.ahead(6);
      RobotExt.fireToXY(robot, this.enemy.position.x, this.enemy.position.y);
    },
    onScannedRobot: function(ev) {
      this.setOptions({
        enemy: ev.scannedRobot,
      });
    }
  };

  Robot.prototype.onIdle = function(ev) {
    Strategy.get('onIdle').call(null, ev);
  };

  Robot.prototype.onScannedRobot = function(ev) {
    Strategy.get('onScannedRobot').call(null, ev);
  };

  Robot.prototype.onRobotCollision = function(ev) {
    Strategy.get('onRobotCollision').call(null, ev);
  };

  Robot.prototype.onWallCollision = function(ev) {
    Strategy.get('onWallCollision').call(null, ev);
  };

  Robot.prototype.onHitByBullet = function(ev) {
    Strategy.get('onHitByBullet').call(null, ev);
  };

  Robot.prototype.getStrategy = function() {
    return Strategy;
  };

  Robot.prototype.getEvent = function() {
    return Event;
  };

  Strategy.events = {};
  Event.events = {};
  Strategy.replace(MoveToCenterStrategy);
  Event.on('onCenter', function() {
    Strategy.replace(SeekerStrategy);
  });
  Event.on('onSeek', function(options) {
    AttackStrategy.setOptions(options);
    Strategy.replace(AttackStrategy);
  });

})();

if (module && module['exports']) {
  module.exports = Robot;
}


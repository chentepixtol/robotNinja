
var Robot = function(robot) {
};

(function() {

  var init = false;
  var pi = 3.141592;

  var Enviroment = {
    init: function(robot) {
      if (!init) {
        this.center.x = Math.floor(robot.arenaWidth / 2);
        this.center.y = Math.floor(robot.arenaHeight / 2);
        init = true;
      }
    },
    center: {
      x: 0,
      y: 0,
    },
    toRadians: function(degrees) {
      return degrees * ( pi / 180 );
    },
    toDegrees: function(radians) {
      return radians * ( 180 / pi );
    },
    moveToXY: function(robot, x, y) {
      var angle = 180 - this.calculateAngle(robot.position.x, robot.position.y, x, y) - robot.angle;
      if (robot.position.x < x) {
        if (robot.position.y < y ) {
          robot.turn(angle);
        } else {
          robot.turnLeft(angle);
        }

      } else {
        if (robot.position.y > y) {
          robot.turnLeft(angle);
        } else {
          robot.turn(angle);
        }
      }

      robot.log(angle);
      robot.ahead(this.calculateHypontenus(robot.position.x, robot.position.y, x, y));
    },
    moveToCenter: function(robot) {
      this.init(robot);
      this.moveToXY(robot, this.center.x, this.center.y);
    },
    calculateAngle: function(x, y, cx, cy) {
      return this.toDegrees(Math.asin(Math.abs(cx - x) / this.calculateHypontenus(x, y, cx, cy)));
    },
    calculateHypontenus: function(x, y, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));
    },
  };

  function composite(functions){
    return function() {
      var context = this;
      var args = Array.prototype.slice.call(arguments, 0);
      var response = [];
      functions.forEach(function(fn) {
        response.push(fn.apply(context, args));
      });
      return response;
    };
  }

  var Strategy  = {
    events: {},
    get: function(name) {
      return this.events[name] ? composite(this.events[name]) : function(){};
    },
    add: function(name, callback) {
      if (this.events[name]) {
        this.events[name].push(callback);
      } else {
        this.events[name] = [callback];
      }
    },
    append: function(object) {
      for(var property in object){
        this.add(property, object[property]);
      }
    },
    replace: function(object) {
      for(var property in object){
        delete this.events[property];
        this.add(property, object[property]);
      }
    },
  };

  Robot.prototype.onIdle = function(ev) {
    Strategy.get('onIdle').call(ev.robot, ev);
  };

  Robot.prototype.onScannedRobot = function(ev) {
    Strategy.get('onScannedRobot').call(ev.robot, ev);
  };

  Robot.prototype.onRobotCollision = function(ev) {
    Strategy.get('onRobotCollision').call(ev.robot, ev);
  };

  Robot.prototype.onWallCollision = function(ev) {
    Strategy.get('onWallCollision').call(ev.robot, ev);
  };

  Robot.prototype.onHitByBullet = function(ev) {
    Strategy.get('onHitByBullet').call(ev.robot, ev);
  };

  Robot.prototype.getStrategy = function(ev) {
    return Strategy;
  };

})();

if (module && module['exports']) {
  module.exports = Robot;
}


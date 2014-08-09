
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
    calculateAngle: function(x, y, cx, cy) {
      var angle = Math.abs(this.toDegrees(Math.asin(Math.abs(cx - x) / this.calculateHypontenus(x, y, cx, cy))));
      var quad = this.getCuadrant(x,y,cx,cy);
      if (1 == quad) {
        angle = 180 - angle;
      } else if (2 == quad) {
        angle = 180 + angle;
      } else if (4 == quad) {
        angle = 360 - angle;
      }
      return angle;
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

  var MoveToCenterStrategy = {
    onIdle: function() {
      Arena.moveToCenter(this);
    }
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


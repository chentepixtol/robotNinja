var assert = require("assert");
var Robot = require("../robot.ninja.js");

var robot = new Robot();

describe('Event', function() {

  var Event = robot.getEvent();

  describe('#on() and #trigger', function(){
    it('should be suscribe callbacks and execute when is triggered', function(){
      Event.on('customEvent', function(options) {
        return 'customResponse' + options.customArg;
      });

      assert.deepEqual(['customResponse123'], Event.trigger('customEvent', {customArg: 123}));
    })
  })

})

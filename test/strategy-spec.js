var assert = require("assert");
var Robot = require("../robot.ninja.js");

var robot = new Robot();

describe('Strategy', function() {

  var strategy = robot.getStrategy();

  describe('#append()', function(){
    it('should be append callbacks and execute all', function(){
      strategy.append({onEventName: function(arg1, arg2) {
        return arg1 + arg2 + '1';
      }});
      assert.deepEqual(['ab1'], strategy.get('onEventName')('a', 'b'));
      strategy.append({onEventName: function(arg1, arg2) {
        return arg2 + arg1 + '2';
      }});
      assert.deepEqual(['ab1', 'ba2'], strategy.get('onEventName')('a', 'b'));
    })
  })

  describe('#replace()', function(){
    it('should be remove all previous callbacks and execute last', function(){
      strategy.replace({onEventName: function(arg1, arg2) {
        return arg1 + arg2 + '1';
      }});
      assert.deepEqual(['ab1'], strategy.get('onEventName')('a', 'b'));
      strategy.replace({onEventName: function(arg1, arg2) {
        return arg2 + arg1 + '2';
      }});
      assert.deepEqual(['ba2'], strategy.get('onEventName')('a', 'b'));
    })
  })

})
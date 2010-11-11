/*
natural passes test/natural.asynct, but fails test/natural.random.asynct
natural2 passes test/natural.asynct, and test/natural.random.asynct

*/

/*
if(module.main === module){
//  run!
}*/

var asynct = require('async_testing')
  , assert = require('assert')
  , modules = require('remap/modules')
  , resolve = require('remap/resolve')


/*
  what do i have? a test, and a 
  a test, the target for the test
  and list of candidates.

*/

function MultiTest (){

  this.run = run
  function run (trial,finished){
    assert.ok('string' === typeof trial.test,'trial.test is a string')
    assert.ok('string' === typeof trial.target,'trial.target is a string')
    assert.ok('string' === typeof trial.candidate,'trial.candidate is a string')

      var tools = {
        resolve: function (request,_module){
          console.log("resolve: " + request)
          if(request === trial.target){ request = trial.candidate }
          return resolve.resolveModuleFilename(request,_module)
        }
      }
      _modules = modules.useCache({})
      
      _require = _modules.makeRequire(module,{make: _modules.makeMake(tools)})
    
      asynct.runSuite(_require(trial.test),{onSuiteDone: suiteDone})
      
      function suiteDone(status,report){
        report.test = trial.test
        report.target = trial.target
        report.candidate = trial.candidate
        
        finished(status,report)
      }
  }
}



module.exports = MultiTest

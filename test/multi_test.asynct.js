//multi_test.asynct.js



var MultiTest = require('remap/multi_test')


function isCalled(test,func,deadline,obj){
  deadline = deadline || 500
  var time = setTimeout(tooLate,deadline)

  return function (){
    clearTimeout(time)
    func.apply(obj,arguments)
  }

  function tooLate(){
    test.ok(false,"expected function " + func + " to have been called within " + deadline + " milliseconds")
  }
}

function checkTestTrial (test,pass,trial,next){

  new MultiTest().run(trial,makeCheckResult(pass))

  function makeCheckResult(pass){
    var zero = pass ? 'numFailures' : 'numSuccesses'
      , oneOrMore = pass ? 'numSuccesses' : 'numFailures'
      , result = pass ? 'pass' : 'fail'
    return isCalled(test,checkResult) 
    
    function checkResult(status,report){
      test.equal(status,'complete')

      test.equal(report.test,trial.test,'report has correct .test property')
      test.equal(report.target,trial.target,'report has correct .target property')
      test.equal(report.candidate,trial.candidate,'report has correct .candidate property')
      
      test.equal(report[zero],0,"expected " + trial.candidate + " to " + result + " test: " + trial.test + " (" + zero + " === 0)" )
      test.ok(report[oneOrMore] > 0,"expected " + trial.candidate + " to " + result + " test: " + trial.test + " (" + oneOrMore + " > 0)")
      console.log(report)
      next()
    }
  }
}

exports['run a test'] = function (test){

  var mt = new MultiTest()
    , trial = 
        { test: 'remap/examples/test/natural.asynct.js'
        , target: 'remap/examples/natural'
        , candidate: 'remap/examples/natural'
        }
  checkTestTrial(test,true,trial,test.finish)
}

exports['run a test with a candidate in place of a target'] = function (test){

  var mt = new MultiTest()
    , fail_trial = 
        { test: 'remap/examples/test/natural.random.asynct'
        , target: 'remap/examples/natural2'
        , candidate: 'remap/examples/natural'
        }
    , pass_trial = 
        { test: 'remap/examples/test/natural.random.asynct'
        , target: 'remap/examples/natural2'
        , candidate: 'remap/examples/natural2'
        }
  checkTestTrial(test,false,fail_trial,next)
  function next(){  
  checkTestTrial(test,true,pass_trial,test.finish)
  }
}






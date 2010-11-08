
var make = require('remap/make_require')
//  , modules = require('remap/modules')
  , resolve = require('remap/resolve')
  , helper = require('./.helper/helper')

exports['mamake can make a normal makeRequire'] = function (test){
  var cache = {}
    , makeRequire = make.useCache(cache).mamake()
    , require2 = makeRequire(module)
    
    , a = require2('./.examples/a')

    helper.test_a(a,test)   
  
    helper.looksLikeRequire(require2,test)

    test.finish()
}


exports['mamake can replace resolve'] = function (test){
  var cache = {}
//    , modules2 = modules.useCache(cache)
    , makeRequire = make.useCache(cache).mamake(newResolve)//resolve returns b instead
    , require2 = makeRequire(module)
    
    , res = newResolve('./.examples/a',module)
    
    test.equal(res.length,2)
    test.equal(res[1],require.resolve('./.examples/b'))

    var a = require2('./.examples/a')

    test.doesNotThrow(function(){helper.test_b(a,test)})
    test.throws(function(){helper.test_a(a,test)})
  
    helper.looksLikeRequire(require2,test)

    test.finish()
    
    function newResolve (request,module){
      return resolve.resolveModuleFilename('./.examples/b',module)
    }
}

exports['mamake can replace load'] = function (test){
  var cache = {}
//    , modules2 = modules.useCache(cache)
    , makeRequire = make.useCache(cache).mamake(undefined,newLoad)//resolve returns b instead
    , require2 = makeRequire(module)

    , a = require2('./.examples/a')//should get the mock returned in newLoad instead!

    test.throws(function(){helper.test_b(a,test)})
    test.throws(function(){helper.test_a(a,test)})
  
    helper.looksLikeRequire(require2,test)

    test.equal(a.func(),2346457)
    test.equal(a.what,"a magic number")

    test.finish()
    
    function newLoad (id,filename,module,make){
      return {
        func: function (){return 2346457}
      , what: "a magic number"
      }
    }
}
/*
  next figure out how to do useful stuff with recursive make functions

  how will i test that?
*/

exports ['mamake can create can change make on the way down'] = function (test){
  
  var cache = {}
//    , modules2 = modules.useCache(cache)
    , make_require = make.useCache(cache)
    , mamake = make_require.mamake
    , makeRequire = mamake(null,null,mamake(null,load2))
    , timer = setTimeout(function(){test.ok(false,"load2 was not called,\n should have been called by b's require")})
    , require2 = makeRequire(module)
    //the first require should load normally
    //but any modules that module loads should use load2 instead!
    , b = require2('./.examples/b')
    function load2(id, filename, parent, makeR){
      test.equal(filename,require.resolve('./.examples/c'))
      console.log(makeR)
      clearTimeout(timer)
      test.finish();
      return make_require.defaultLoad(id, filename, parent, makeR)
    }
      
}




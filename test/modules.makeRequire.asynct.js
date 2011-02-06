
var modules = require('remap/modules')
  , resolve = require('remap/resolve')
  , helper = require('./.helper/helper')
  , Xexports = {}
  , inspect = require('sys').inspect
  , require2 = modules.makeRequire(module)
  
//  var modules =  require('remap/modules')
//  , resolve = require('remap/resolve')

function looksLikeRequire(test,r){
  var types = 
    { resolve: 'function'
    , paths:  'object'
    , extensions: 'object'
    , registerExtension: 'function'
    , cache:   'object'
    , main:  'object'
    }
    
    for (i in types){
      test.equal(typeof r[i], types[i], "typeof :'" + r + '.'  + i + ' should be: ' + types[i] + ', but was: ' +  typeof r[i])
    }
}

exports ['can change the require method for child modules'] = function (test){

  var modules2 = modules.useCache({})
    , require2 = modules2.makeRequire(module)
    , a = modules2.loadModule('./.examples/a',module).exports
    , a1 = require2('./.examples/a')
    , inside = null
    , a2 = modules2.loadModule('./.examples/for_modules.asynct',module,makeRequire).exports
    
    test.strictEqual(a,a1
      , "modules.loadModule(X,module) will return the same as module.makeRequire(module).require(X)")

    test.strictEqual(inside.exports,a2, "this inside makeRequire should be the new module")
    test.finish()

    function makeRequire (m){
      var r = modules.makeRequire (module)//this is a question about the default cache...
      test.equal (m.parent,module)
      test.equal (this,m)
      looksLikeRequire (test,r)
    
      inside = this
      return r
    }
}

/*
  A new modules function which takes function arguments for require, resolveModule, and makeRequire
  
  maybe refactor all the require stuff into another module?
  
  mamake(resolve,make,require){
  }
*/

exports['mamake can make a normal makeRequire'] = function (test){
  var cache = {}
    , makeRequire = modules.useCache(cache).mamake()
    , require2 = makeRequire(module)
    
    , a = require2('./.examples/a')
   , b = require2('./.examples/b')

    helper.looksLikeRequire(require2,test)

    helper.test_a(a,test)   
    helper.test_b(b,test)   
  
    test.finish()
}


exports['mamake can replace resolve'] = function (test){
  var cache = {}
    , modules2 = modules.useCache(cache)
    , makeRequire = modules2.mamake(newResolve/*,null,make2.makeRequire*/)//resolve returns b instead
    , require2 = makeRequire(module)
    , calls = 0
    , res = newResolve('./.examples/a',module)
    
    test.equal(calls,1)
    test.equal(res.length,2)
    test.equal(res[1],require.resolve('./.examples/b'))

    var a = require2('./.examples/a')
    test.equal(calls,2,"new resolve should call 2 times but was:" + calls)

    test.doesNotThrow(function(){helper.test_b(a,test)})
    test.throws(function(){helper.test_a(a,test)})
  
    helper.looksLikeRequire(require2,test)

    test.finish()
    
    function newResolve (request,_module){
      calls++

      return resolve.resolveModuleFilename('./.examples/b',module)//_?
    }
}


exports['mamake can replace load'] = function (test){
  var cache = {}
    , makeRequire = modules.useCache(cache).mamake(undefined,newLoad)//resolve returns b instead
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
    , modules2 = modules.useCache(cache)
    , mamake = modules2.mamake
    , makeRequire = mamake(null,null,mamake(null,load2))
      //the first require should load normally
      //but any modules that module loads should use load2 instead!
    , timer = setTimeout(function(){test.ok(false,"load2 was not called,\n should have been called by b's require")})
    , require2 = makeRequire(module)
    , loadCalled = false
    , b = require2('./.examples/b')
    
    helper.test_b(b,test)
    test.ok(loadCalled,"expected replaced load to have been called")
    test.finish()
    function load2(id, filename, parent, makeR,cache) {
      test.equal(filename,require.resolve('./.examples/c'))

      clearTimeout(timer)
      loadCalled = true;
      return modules2.defaultLoad(id, filename, parent, makeR,cache)
    }
      
}

exports['makeMake can replace resolve'] = function (test){
  var cache = {}
    , modules2 = modules.useCache(cache)
    , makeRequire = modules2.makeMake({resolve:newResolve})//resolve returns b instead
    , require2 = makeRequire(module)
    , calls = 0
    , res = newResolve('./.examples/a',module)
    test.equal(calls,1)
    test.equal(res.length,2)
    test.equal(res[1],require.resolve('./.examples/b'))

    var a = require2('./.examples/a')
    test.equal(calls,2,"new resolve should call 2 times but was:" + calls)

    test.doesNotThrow(function(){helper.test_b(a,test)})
    test.throws(function(){helper.test_a(a,test)})
  
    helper.looksLikeRequire(require2,test)

    test.finish()
    
    function newResolve (request,_module){
      calls++
      return resolve.resolveModuleFilename('./.examples/b',module)//_?
    }
}

exports['makeMake can replace load'] = function (test){
  var cache = {}
    , makeRequire = modules.useCache(cache).makeMake({load:newLoad})//resolve returns b instead
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

exports ['makeMake can create can change make on the way down'] = function (test){
  
  var cache = {}
    , modules2 = modules.useCache(cache)
    , makeMake = modules2.makeMake
    , makeRequire = makeMake({make:makeMake({load:load2})})
      //the first require should load normally
      //but any modules that module loads should use load2 instead!
    , timer = setTimeout(function(){test.ok(false,"load2 was not called,\n should have been called by b's require")})
    , require2 = makeRequire(module)
    , loadCalled = false
    , b = require2('./.examples/b')
    
    helper.test_b(b,test)
    test.ok(loadCalled,"expected replaced load to have been called")
    test.finish()
    function load2(id, filename, parent, makeR,cache){
      test.equal(filename,require.resolve('./.examples/c'))

      clearTimeout(timer)
      loadCalled = true;
      return modules2.defaultLoad(id, filename, parent, makeR,cache)
    }
      
}



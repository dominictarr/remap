//modules.useCache
var modules = require('remap/modules')
  , require2 = modules.makeRequire(module)

exports ['modules.useCache should not change normal modules exports'] = function (test){
  var cache1 = {}
    , cache2 = {}
    , require1 = modules.makeRequire(module)
    , a = require1('./.examples/a')
    , require2 = modules.useCache(cache1).makeRequire(module)
    , a1_2 = require2('./.examples/a')
    , a1 = require1('./.examples/a')
    , require3 = modules.useCache(cache2).makeRequire(module)
    , a2 = require1('./.examples/a')
    , a2_2 = require2('./.examples/a')
    
    test.strictEqual(a1,a)
    test.strictEqual(a2,a)
    test.strictEqual(a2,a1)

    test.strictEqual(a2_2,a1_2)
    
    test.finish()
}


exports ['loading useCache doesn\'t break earlier caches '] = function (test){

  var a = modules.loadModule('./.examples/a',module).exports
    , a1 = require2('./.examples/a')
    , inside = null
//    , a2 = modules.loadModule('./.examples/for_modules.asynct',module).exports
    
    test.strictEqual(a,a1
      , "modules.loadModule(X,module) will return the same as module.makeRequire(module).require(X)")

    test.strictEqual (a,a1
      , "modules.loadModule(X,module) will return the same as module.makeRequire(module).require(X)")

//    test.strictEqual (inside.exports,a2)
    test.finish ()


}

var modules =  require('remap/modules')
  , require2 = modules.makeRequire(module)
  , inspect = require('util').inspect
  , helper = require('./.helper/helper')

; // a semi-colon for Ryan Gahl

//var Xexports = {}

exports['Require2 can load a module'] = function (test){

  var a1 = require2('./.examples/a')

  test.finish()
}

exports['loads a module with different module, require'] = function (test){

  var mirror = require2('./.examples/mirror')
    , mirror1 = require2('./.examples/mirror')
    , mirror2 = require('./.examples/mirror')
    
  test.ok(mirror.require)
  test.ok(mirror.__filename)
  test.ok(mirror.__dirname)
  test.ok(mirror.module)

  helper.looksLikeRequire(mirror.require,test)

  test.notEqual(mirror,mirror2
    , "require 2 can load another instance of a module")
  test.strictEqual(mirror,mirror1,"require2 still use a cache")

  test.equal(mirror.require.cache,mirror.require.cache)
  test.equal(require.cache,require.cache)
  
  test.notEqual(mirror.require.cache,require.cache)//loads a different cache.

  test.finish()
}

exports['modules.loadModule accepts a function which is assigned to module and called after require is made'] = function (test){
  var a = modules.loadModule('./.examples/a',module).exports
    , a1 = require2('./.examples/a')
    , inside = null
    , a2 = modules.loadModule('./.examples/for_modules.asynct.js',module,modules.makeWrapRequire(wrapRequire)).exports
    
    test.strictEqual(a,a1
      , "modules.loadModule(X,module) will return the same as module.makeRequire(module).require(X)")

    test.strictEqual(inside.exports,a2)
    test.finish()

    function wrapRequire (r,this_module){
      helper.looksLikeRequire(r,test)
    
      inside = this_module
      return r
    }

    /*  applications of this crazy module:
        1. reroute resolve, so that it loads a different module.
        2. return before calling loadModule, i.e. return a mock instead.
        3. modify module loaded. 
          i.e. wrap it and record what is called.
          or wrap all db queries in a transaction and revert it after the test. 
        4. change the makeRequire method for children...
    */
}

exports['modules can uncache a loaded module'] = function (test){
  var a,a2,a3, aId = './.examples/a'

    a_module = modules.loadModule(aId,module)
    a = a_module.exports
    test.strictEqual(a,modules.loadModule(aId,module).exports
      , 'normally modules.loadModule will return the same modules from the cache')
   
    test.ok(modules.moduleCache[a.module.filename]
      , 'should load module into cache')
    
    modules.uncache(a_module)
    a2 = modules.loadModule(aId,module).exports

    test.notStrictEqual(a,a2
      , 'by uncaching you can load a module twice')

    test.strictEqual(a.a(),a2.a())
    test.strictEqual(a.version,a2.version)
    test.strictEqual(a.__filename,a2.__filename)
    
    test.finish()
}


exports ['modules can be given a new cache to load into'] = function (test){
    var cache = {}
    modules2 = modules.useCache(cache)
    require3 = modules2.makeRequire(module)
    helper.looksLikeRequire(require3,test)
    
    test.strictEqual(modules2.moduleCache,cache 
      ,"modules.useCache(X).moduleCache === X" )
    test.strictEqual(require3.cache,cache
      ,"modules.useCache(X).makeRequire().cache === X" )
    test.notStrictEqual(require3.cache,require2.cache
      ,"will have a different cache from another moduels.makeRequire().cache" )
    
    
    //reload same twice my useing a different cache.
    var cache1 = {}
      , cache2 = {}
      , a1 = modules.useCache(cache1)
        .makeRequire(module)('./.examples/a')
      , a2 = modules.useCache(cache2)
        .makeRequire(module)('./.examples/a')

      //modules
      test.equal(cache1[require.resolve('./.examples/a')].exports,a1
        , "should load module into right cache")
      test.equal(cache2[require.resolve('./.examples/a')].exports,a2
        , "should load module into right cache 2")

    test.finish()
}

exports ['modules makeRequire().resolve should work like require.resolve'] = function (test){
  var require2 = modules.makeRequire(module)
    , tests = ['./.examples/c','remap/test/.examples/c','./.examples/b']
  
  tests.forEach(function (e){
    var a = require2.resolve(e)
      , b = require.resolve(e)
    test.equal(a,b,"expected:" + b + " but got " + a)  
  });
  test.finish()

}

exports ['modules should load children into the same cache'] = function (test){
  var cache = {}
    , modules2 = modules.useCache(cache)
    , require2 = modules2.makeRequire(module)
    , b = require2('./.examples/b')
    
  test.equal(b.b(),"B is for Banana")
  test.equal(b.next(),"C is for Chicken")

  test.equal(modules2.moduleCache,cache)
  test.equal(require2.cache,cache)

  test.equal(require2.resolve('./.examples/c'),require.resolve('./.examples/c')
    ,"expected: " + require2.resolve('./.examples/c')
    + " but got: " + require.resolve('./.examples/c')      )
  test.equal(require2.resolve('./.examples/b'),require.resolve('./.examples/b'))

  var b_module = cache[require2.resolve('./.examples/b')]
    , c_module = cache[require2.resolve('./.examples/c')]
   
  test.strictEqual(b,b_module.exports)
  test.strictEqual(b.next,c_module.exports.c)
    
  test.strictEqual(b_module,c_module.parent)
  test.strictEqual(module,b_module.parent)
  
  test.finish()
}
exports ['modules recreate thier "globals" for each cache'] = function (test){
  var o = {}
    , require2 = modules.useCache({}).makeRequire(module)
  o.require = require('./.examples/one_random')
  o.require2 = require2('./.examples/one_random')
  
  test.ok(o.require.oneRandom)
  test.ok(o.require2.oneRandom)
  test.notEqual(o.require.oneRandom,o.require2.oneRandom)
  
  test.finish();
}
exports ['modules can load native modules'] = function (test){
  var require2 = modules.useCache({}).makeRequire(module)
  fs = require2('fs')
  http = require2('http')
  
  test.finish()
}


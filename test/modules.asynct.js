var modules =  require('remap/modules')
  , require2 = modules.makeRequire(module)
  , inspect = require('util').inspect
  
exports['Require2 can load a module'] = function (test){

  var a1 = require2('./.examples/a')
  /*  , a2 = require2('./.examples/a2')

  test.equal(a1.a(),'A is for Apple')
  test.equal(a2.a(),'A is for Aardvark')
*/
  test.finish()
}

function looksLikeRequire(test,r){
  test.ok('function' === typeof r.resolve)
  test.ok('object' === typeof r.paths)
  test.ok('object' === typeof r.extensions)
  test.ok('function' === typeof r.registerExtension)
  test.ok('object' === typeof r.cache)
  test.ok('object' === typeof r.main)
}

exports['loads a module with different module, require'] = function (test){

  var mirror = require2('./.examples/mirror')
    , mirror1 = require2('./.examples/mirror')
    , mirror2 = require('./.examples/mirror')
    
  test.ok(mirror.require)
  test.ok(mirror.module)
  test.ok(mirror.__filename)
  test.ok(mirror.__dirname)

  looksLikeRequire(test,mirror.require)

  test.notEqual(mirror,mirror2,"require 2 can load another instance of a module")
  test.strictEqual(mirror,mirror1,"require2 still use a cache")

  test.equal(mirror.require.cache,mirror.require.cache)
  test.equal(require.cache,require.cache)
  
  test.notEqual(mirror.require.cache,require.cache)//loads a different cache.

  test.finish();
}

exports['modules.loadModule accepts a function which is assigned to module and called after require is made'] = function (test){
  var a = modules.loadModule('./.examples/a',module).exports
    , a1 = require2('./.examples/a')
    , inside = null
    , a2 = modules.loadModule('./.examples/for_modules.asynct.js',module,wrapRequire).exports
    
    test.strictEqual(a,a1,"modules.loadModule(X,module) will return the same as module.makeRequire(module).require(X)")

    test.strictEqual(inside.exports,a2)
    test.finish();

    function wrapRequire (r){
      looksLikeRequire(test,r)
      
      /*
        here is where you'd modify the behaviour of require.
        
        actually, you'll probably just make a whole new makeRequire
        
        you could intercept the request and ask for something different
        
        also, you could just return something completely different.. mock it out...
        
        another thing that is necessary is optionally don't cache it, so that a 
        second version of a module can be loaded... say with different dependency implementations.
      */
      
      inside = this
      return r
    }
}

exports['modules can uncache a loaded module'] = function (test){
  var a,a2,a3, aId = './.examples/a'

    a_module = modules.loadModule(aId,module)
    a = a_module.exports
    test.strictEqual(a,modules.loadModule(aId,module).exports,'normally modules.loadModule will return the same modules from the cache')
   

//    console.log('LOOKING FOR: ' + a.filename)

  //  console.log('cache: ' + inspect(modules.moduleCache))
    
   
    test.ok(modules.moduleCache[a.module.filename],'should load module into cache')
    
    modules.uncache(a_module)
    a2 = modules.loadModule(aId,module).exports

    console.log('cache: ' + inspect(require.cache))

    test.notStrictEqual(a,a2,'by uncaching you can load a module twice')

    test.strictEqual(a.a(),a2.a())
    test.strictEqual(a.version,a2.version)
    test.strictEqual(a.__filename,a2.__filename)
    
    //okay, maybe make an uncache method on require? pass it a it resolves it, then uncaches it. 
    //and IT'S DEPENDANTS...
    
    //there is a children property on module, but it doesn't get set.
    //A. iterate through cache for module.parent === this
    //B. set children.
    
    //all this will surely fuck up singletons. they will be reloaded ... 
    //remove from parents children also, so that uncached modules gets garbage collected?
    /*
    it is probably much better to use a special cache when you'll be reloading.
    that way, you just throw away the whole cache, and you won't get anything dangling.
    
    
    */
    //I don't have a test for load of children yet anyway.
  
    test.finish();  
}


exports ['modules can be given a new cache to load into'] = function (test){
    var cache = {}
    modules2 = modules.useCache(cache)
    require3 = modules2.makeRequire(module)
    looksLikeRequire(test,require3)
    
    test.notStrictEqual(require3.cache,require2.cache,"will have a different cache from another moduels.makeRequire().cache" )
    
    test.strictEqual(modules2.moduleCache,cache,"modules.useCache(X).moduleCache === X" )
    test.strictEqual(require3.cache,cache,"modules.useCache(X).makeRequire().cache === X" )
    
    test.finish();
}

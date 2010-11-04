var modules =  require('remap/modules')
  , require2 = modules.makeRequire(module)
  , inspect = require('util').inspect

; // a semi-colon for Ryan Gahl
  
exports['Require2 can load a module'] = function (test){

  var a1 = require2('./.examples/a')
  /*  , a2 = require2('./.examples/a2')

  test.equal(a1.a(),'A is for Apple')
  test.equal(a2.a(),'A is for Aardvark')
*/
  test.finish()
}

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

exports['loads a module with different module, require'] = function (test){

  var mirror = require2('./.examples/mirror')
    , mirror1 = require2('./.examples/mirror')
    , mirror2 = require('./.examples/mirror')
    
  test.ok(mirror.require)
  test.ok(mirror.module)
  test.ok(mirror.__filename)
  test.ok(mirror.__dirname)

  looksLikeRequire(test,mirror.require)

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
    , a2 = modules.loadModule('./.examples/for_modules.asynct.js',module,wrapRequire).exports
    
    test.strictEqual(a,a1
      , "modules.loadModule(X,module) will return the same as module.makeRequire(module).require(X)")

    test.strictEqual(inside.exports,a2)
    test.finish()

    function wrapRequire (r){
      looksLikeRequire(test,r)
    
      inside = this
      return r
    }

      /*
        here is where you'd modify the behaviour of require.
        
        actually, you'll probably just make a whole new makeRequire
        
        you could intercept the request and ask for something different
        
        also, you could just return something completely different..
           mock it out...

      *//*
      
        hmm, maybe should pass requireWrapper into load module.
        
        then it is just
        modules = require('modules')
        modules.loadModule('id',module,wrapper).exports
        that asigns the wrapper to the module,
        then _compile calls it. which also gets to (re)define what it asigns to 
        the next require in submodules...

        yes that will work.

        applications of this crazy module:
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
   

//    console.log('LOOKING FOR: ' + a.filename)

  //  console.log('cache: ' + inspect(modules.moduleCache))
    
   
    test.ok(modules.moduleCache[a.module.filename]
      , 'should load module into cache')
    
    modules.uncache(a_module)
    a2 = modules.loadModule(aId,module).exports

//    console.log('cache: ' + inspect(require.cache))

    test.notStrictEqual(a,a2
      , 'by uncaching you can load a module twice')

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
  
    test.finish()
}


exports ['modules can be given a new cache to load into'] = function (test){
    var cache = {}
    modules2 = modules.useCache(cache)
    require3 = modules2.makeRequire(module)
    looksLikeRequire(test,require3)
    
    test.notStrictEqual(require3.cache,require2.cache
      ,"will have a different cache from another moduels.makeRequire().cache" )
    
    test.strictEqual(modules2.moduleCache,cache 
      ,"modules.useCache(X).moduleCache === X" )
    test.strictEqual(require3.cache,cache
      ,"modules.useCache(X).makeRequire().cache === X" )
    
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

exports ['modules should load children into the same cache'] = function (test){
  var cache = {}
    , modules2 = modules.useCache(cache)
    , require2 = modules.makeRequire(module)
    , b = require2('./.examples/b')
    
  test.equal(b.b(),"B is for Banana")
  test.equal(b.next(),"C is for Chicken")

  /*
    check the children are correct!
    
    check that c is in the cache. 
    and that it's parent is b.
    
    ... just resolve('./.examples/b') to get c.
  */
  
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
  var o = {}
    , require2 = modules.useCache({}).makeRequire(module)
  fs = require('fs')
  http = require2('http')
  
/*  test.ok(o.require.oneRandom)
  test.ok(o.require2.oneRandom)
  test.notEqual(o.require.oneRandom,o.require2.oneRandom)
  */
  
  test.finish()
}


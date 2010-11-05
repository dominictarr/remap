//modules.wrapRequire.asynct
/*
TEST PLANS:

  applications of this crazy module:
    1. reroute resolve, so that it loads a different module. --done at one level.
    2. return before calling loadModule, i.e. return a mock instead.
    3. modify module loaded. 
      i.e. wrap it and record what is called.
      or wrap all db queries in a transaction and revert it after the test. 
    4. change the makeRequire method for children...

  i've got it doing the things i want now, but it's messy. next is refactor to make this easier.
  
  1. resolve. make resolve call a function 'resolveId' which calls resolveModule and returns [id,filename]
  2. be able to wrap any method is before, after and around methods.
  
  then use syntax like
  
  before: possibly change arguments passed to function. called with (args)
  after: possibly change return value passed to function, called with (func, args)
  around: all of the above, and possibly call a different function. called with return value
  
  is before called before around? or when around calls func? probably doesn't 
  matter cos if your using both at the same time your probably trying to be too 
  
  {
    around: function (oldFunc,path) { returns something different, or calls oldFunc}
    resolve: {before: function (){}
  }

  maybe I'm being too clever...
  
  prehaps important methods are just:
  require, resolveIdFilename, and wrapRequire
  
  instead of calling wrapRequire after it's setup require & properties it passes 
  the functions and then tidies it up.


  if instead of wrapRequire, module has a makeRequire function? would that be simpler?

  then, any weird makeRequire you want will have just reassign module.makeRequire
*/

var modules =  require('remap/modules')
  , require2 = modules.makeRequire(module)
  , resolve = require('remap/resolve')
  , inspect = require('util').inspect

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

exports ['can wrap the require method for child modules'] = function (test){
  console.log('TEST: can wrap the require method for child modules')

  var cache = {}
    , modules2 = modules.useCache(cache)
    , a = modules.loadModule('./.examples/a',module).exports
    , a1 = require2('./.examples/a')
    , inside = null
    , a2 = modules2.loadModule ( './.examples/for_modules.asynct'
        , module, modules2.makeWrapRequire(wrapRequire) ).exports
    
    test.strictEqual (a,a1
      , "modules.loadModule(X,module) will return the same as module.makeRequire(module).require(X)")

    test.strictEqual (inside.exports,a2)
    test.finish ()

    function wrapRequire (r,module){
      console.log("MODULE:" + module)
      looksLikeRequire (test,r)
      test.ok(module,"expected a module")
      inside = module
      return r
    }
}

exports ['can change which module is loaded by redefining resolve'] = function (test){
  var cache = {}
    , __modules = modules.useCache (cache)
//    , a = modules.loadModule('./.examples/a',module,wrapRequire).exports
    , a1  = require('./.examples/a')
    , newResolveCalled = false
    , __require = wrapRequire(__modules.makeRequire(module))
    , a2  = __require('./.examples/a')
    /*
    
      the regular require load ./.examples/a which will .a() -> "A is for Apple"
      but the new one will load a2 instead.  

      this doesn't say anything about what happens to require on submodules. 
      if I set module.wrapRequire = wrapRequire 
      it change, but break, because
      
      refactor this to use a different function to resolve, which returns [id,filename]
      and have require call it.
    */
    test.ok (newResolveCalled,"require.resolve should be called when require is called")

    test.equal (a1.a(),"A is for Apple")
    test.equal (a2.a(),"A is for Aardvark")
    
    test.finish()
 
    function wrapRequire (_require){

      _require.resolve = newResolve
 
      return _require
 
      function newResolve (id){
        newResolveCalled = true;
        var remap =
          { './.examples/a': './.examples/a2'
          , './.examples/b': './.examples/c'
          }
          console.log('remap :' + id + " -> " + remap[id] || id)
        return resolve.resolveModuleFilename(remap[id] || id, module)[1]
      }
    }
}

exports ['can return a mock in the place of a module'] = function (test){

   var cache = {}
    , __modules = modules.useCache(cache)
    , newRequireCalled = false
    , mockA = 
        { a: function (){return "A is for Airplane"}}
    , __require = wrapRequire(__modules.makeRequire(module))
    , a = __require('./.examples/a')
    , a2 = __require('./.examples/a.js')
    test.ok(newRequireCalled,"require.resolve should be called when require is called")
    
    test.equal(a.a(),"A is for Airplane")
    test.strictEqual(a,a2)
    test.strictEqual(a,mockA)
    
    test.finish();
    /*
    since this method still uses the old require 
    then inside the required module it will work like normal.    
    */
  function wrapRequire(_require){
    
    for (method in _require){
      newRequire[method] = _require[method]
    }
    
    return newRequire
    
    function newRequire(path){
      newRequireCalled = true
      if (/a(\.js)?$/.test(path)){
        return mockA
      } else {
        return _require(path)
      }
    }   
  }
}

exports ['can wrap a module in something which modifies its behaviour'] = function (test){
  var cache = {}
    , __modules = modules.useCache(cache)
    , wrapperListenerCalled = false
    , __require = wrapRequire(__modules.makeRequire(module))
    , a = __require('./.examples/a')
//    test.ok(newRequireCalled,"require.resolve should be called when require is called")
    , expected = [['a',{},'A is for Apple']] 
    
    test.equal(a.a(),'A is for Apple')
//    test.equal(a.a(),'A is for Apple')

    test.deepEqual([],expected)
    test.finish()
    
  function listener(method,args,returned){
      var c = expected.shift()
      test.equal(method,c[0])
      //test.equal(args,c[1]) ... arguments is not an Array type unfortunately...
      test.equal(returned,c[2])
      wrapperListenerCalled = true
  }
 
  function wrapRequire(_require){

    for (method in _require){
      newRequire[method] = _require[method]
    }

    return newRequire
    
    function newRequire (path){
      var m = _require(path)
        , n = {}
      for (i in m){
        if (typeof m[i] === 'function') {
          
          n[i] = scope(m,i)  
          function scope (m,i) {
             return function (){
              var returned = m[i].apply(m,arguments)//better way to handle scope?
//                var returned = m[i]()
              listener(i,arguments,returned)       
              return returned
            }
          }
        } else {
          n[i] = m[i]
        }
      }
      return n
    }
  }
}

exports ['replace require for a child module'] = function (test){
  /*
  make a 
    a require that loads b,
    and then triggers a callback when b requires c.
  */
 
  var cache = {}
   ,  __modules = modules.useCache(cache)
   ,  wrapperListenerCalled = false
   ,  expected = ['./.examples/a','./.examples/b','./c']

  var __require = wrapRequire(__modules.makeRequire(module),module)
   ,  a = __require('./.examples/a')
   ,  b = __require('./.examples/b')
  
  test.ok(wrapperListenerCalled)
  test.deepEqual(expected,[])
  test.finish()

  function listener(path){
    wrapperListenerCalled = true
    var exp = expected.shift()
    test.equal(path,exp)
  }
  
  function wrapRequire (_require,parent){//pass the module into wrap require? then i wouldn't need to worry about this...
    for (method in _require){
      newRequire[method] = _require[method]
    }
    return newRequire
  
    function newRequire(path){
        //test.strictEqual(module,this)
        var id = resolve.resolveModuleId(path,parent)
        , filename = newRequire.resolve(path)
        console.log("load:(" + parent.id + ").require(" + path + ")")
        listener(path)
      return modules.loadResolvedModule (id,filename,parent,modules.makeWrapRequire(wrapRequire)).exports
    } 
  } 
  
}

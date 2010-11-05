//modules.makeRequire

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

exports ['can change the require method for child modules'] = function (test){
 
  var modules2 = modules.useCache({})
    , require2 = modules2.makeRequire(module)
    , a = modules2.loadModule('./.examples/a',module).exports
    , a1 = require2('./.examples/a')
    , inside = null
    , a2 = modules2.loadModule('./.examples/for_modules.asynct',module,makeRequire).exports
    
    test.strictEqual(a,a1
      , "modules.loadModule(X,module) will return the same as module.makeRequire(module).require(X)")

    test.strictEqual(inside.exports,a2)
    test.finish()

    function makeRequire (m){
      var r = modules.makeRequire (module)
      test.equal (m.parent,module)
      looksLikeRequire (test,r)
    
      inside = this
      return r
    }
}

/*
  A new modules function which takes function arguments for require, resolveModule, and makeRequire
  
  maybe refactor all the require stuff into another module?
*/

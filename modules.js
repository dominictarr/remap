
var path = require('path')
  , resolve = require('./resolve')
  , make_require = require('./make_require')
  , assert = require('assert')

  var registerExtension = function(){console.log('require.registerExtension() removed. Use require.extensions instead');}

  exports.resolveModuleFilename = resolve.resolveModuleFilename
  exports.useCache = useCache

function useCache(moduleCache){
  
  var newExports = {}
  for (i in exports){
    newExports[i] = exports[i]
  }
  newExports.loadModule = function (request,parent,make) {
    return make_require.loadModule(request,parent,make,moduleCache)
  }
  newExports.makeRequire = function (parent,tools) {
    tools = tools || {}
    tools.cache = moduleCache
    console.log('WARPPED MAKE REQUIRE')    
    assert.ok(tools.cache)
    return make_require.makeRequire(parent,tools)
  }

  function uncache(module){
    delete moduleCache[module.filename]
  }

  newExports.uncache = uncache
  newExports.moduleCache = moduleCache
  newExports.makeWrapRequire = makeWrapRequire

  function makeWrapRequire (wrap){//adapter to use old interface...
    return function (this_module){
      return wrap(newExports.makeRequire(this_module),this_module)
    }
  }

  return newExports;
}

module.exports = useCache({})


var path = require('path')
  , resolve = require('./resolve')
  , loading = require('./loading')
  , assert = require('assert')

  var registerExtension = function(){console.log('require.registerExtension() removed. Use require.extensions instead');}

  exports.resolveModuleFilename = resolve.resolveModuleFilename
  exports.useCache = useCache

function useCache(moduleCache) {
  
  var newExports = {}
  for (i in exports){
    newExports[i] = exports[i]
  }
  newExports.loadModule = function (request,parent,make) {
    return loading.loadModule(request,parent,make,moduleCache)
  }
  newExports.defaultLoad = function (id,filename,parent,make) {
    return loading.defaultLoad(id,filename,parent,make,moduleCache)
  }
  newExports.mamake = function (resolve,load,make){
    return  loading.mamake (resolve,load,make,moduleCache)
  }
  newExports.makeRequire = function (module,tools){
    return loading.makeRequire(module,initTools(tools))
  }
  newExports.makeMake = function (tools){
    return loading.makeMake(initTools(tools))
  }

  function initTools(tools){
    tools = tools || {}
    tools.cache = tools.cache || moduleCache
    return tools
  }

  newExports.uncache = function (module) {
    delete moduleCache[module.filename]
  }

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

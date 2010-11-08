//make_require


//exports.useCache = useCache

function useCache(cache){
  var modules = require('./modules').useCache(cache)
    , resolve = require('./resolve')
    , exports = {}
    
    /*function makeLoad(resolve,make){
      return function (
//      modules.loadResolvedModule (id,filename,parent,makeR)
    }*/
    exports.defaultLoad = defaultLoad
    exports.mamake = mamake
    exports.makeMake = makeMake
    exports.makeRequire = makeRequire
    exports.useCache = useCache
    exports.cache = cache

    function defaultLoad (id,filename,parent,makeR){
      return modules.loadResolvedModule(id,filename,parent,makeR).exports
    }
    function mamake(resolver,load,make){
      var tools = {
        resolve: resolver
      , load: load
      , make: make
      }
      /*make = make || makeSelf
      
      function makeSelf (module){
        return mamake(resolve,makeSelf,load)(module)
      }*/

      return makeMake(tools)
    }
    
    function makeMake(tools){
      return function (module) {return makeRequire(module,tools)}
    }
    
    function makeRequire(module,tools){
      tools = tools || {}//what if I put tools into 
      tools.resolve = tools.resolve || resolve.resolveModuleFilename
      tools.load = tools.load || defaultLoad //(id,filename,parent,makeR)
      tools.make = tools.make

      newRequire.resolve = function(request) { tools.resolve(request)[1]}
      
      return finishRequire(newRequire)

      function newRequire(request){
        var resolved = tools.resolve(request,module)
          , id = resolved[0]
          , filename = resolved[1]
        return tools.load(id,filename,module,tools.make)
      }
      
      function finishRequire(newRequire){
        newRequire.paths = resolve.modulePaths;
        newRequire.main = process.mainModule;
        // Enable support to add extra extension types
        newRequire.extensions = require.extensions;
        // TODO: Insert depreciation warning
        newRequire.registerExtension = require.registerExtension;
        newRequire.cache = cache;
        return newRequire;
      }
    }
    
    return exports
}
module.exports = useCache({})

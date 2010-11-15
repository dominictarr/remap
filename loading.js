//make_require


//exports.useCache = useCache

var internalModuleCache = {}
  , debug = require('./common').debug
  , Module = require('./module')
  , resolve = require('./resolve')
  , assert = require('assert')

  exports.defaultLoad = defaultLoad
  exports.mamake = mamake
  exports.makeMake = makeMake
  exports.makeRequire = makeRequire

  //exports.useCache = useCache

  var natives = process.binding('natives'); //refactor this out to call require
    // remove this...>>>

  function loadNative (id) {
//    console.log("loadNative")
//    console.log(id)
    
    var m = new Module(id);
    internalModuleCache[id] = m;
    m.require = makeRequire(m,{cache: require.cache})
    /*= function (request){
      console.log("LOAD NATIVE!" + id)
      console.log(request)
    }*/
    var e = m._compile(natives[id], id+".js");
    if (e) throw e; // error compiling native module
    return m;
  }

  exports.requireNative = requireNative;//this doesn't appear to be used anywhere....

  function requireNative (id) {
    if (internalModuleCache[id]) return internalModuleCache[id].exports;
    if (!natives[id]) throw new Error('No such native module ' + id);
    return loadNative(id).exports;
  }

/*
       ====================== load modules ===========================
*/

  exports.loadModule  = loadModule
  exports.loadResolvedModule  = loadResolvedModule
  
  function loadModule (request, parent, makeR, moduleCache) {
    var resolved = resolve.resolveModuleFilename(request, parent);
    var id = resolved[0];
    var filename = resolved[1];

    return loadResolvedModule (id, filename, parent, makeR, moduleCache)
  };

  function loadResolvedModule (id,filename,parent,makeR,moduleCache){
    //moduleCache = moduleCache || cache
//    console.log("CACHE (loadResolvedModule):" + moduleCache)
    assert.ok(moduleCache,"loadResolvedModule needs a moduleCache")
    // remote this...>>>
    var cachedNative = internalModuleCache[id];
    if (cachedNative) {
      return cachedNative;
    }
    if (natives[id]) {
      debug('load native module ' + id);
      return loadNative(id);
    }

    var cachedModule = moduleCache[filename];
//    console.log("cached?:" + (!!cachedModule));
    if (cachedModule) return cachedModule;
    
    var module = new Module(id, parent);

    makeR = makeR || makeMake({cache:moduleCache})

    moduleCache[filename] = module;
//    console.log("STORE in cache:" + filename);
    module.require = makeR.call(module,module);//intercepts creation of require so it can me remapped. called as module, to pass old test.
    module.load(filename);

    return module;
  }

/*
       ====================== load modules ===========================
*/

    function defaultLoad (id,filename,parent,makeR,moduleCache){
      return loadResolvedModule(id,filename,parent,makeR,moduleCache).exports
    }
    function mamake(resolver,load,make,cache){
      var tools = {
        resolve: resolver
      , load: load
      , make: make
      , cache: cache
      }

      return makeMake(tools)
    }
    
    function makeMake(tools){
      return function (module) {return makeRequire(module,tools)}
    }
    
    function makeRequire(module,tools){
      tools = tools || {}//what if I put tools into 
      tools.resolve = tools.resolve || resolve.resolveModuleFilename
      tools.load = tools.load || defaultLoad //(id,filename,parent,makeR,moduleCache)
      tools.make = tools.make || makeMake({cache: tools.cache})
//      tools.cache = tools.cache || cache
//      console.log("CACHE (makeRequire):" + tools.cache)
      assert.ok(tools.cache,"makeRequire needed a tools.cache")
      assert.ok(tools.make,"makeRequire needed a tools.make")

      newRequire.resolve = function(request) { return tools.resolve(request,module)[1]}
      
      return finishRequire(newRequire)

      function newRequire(request){
        var resolved = tools.resolve(request,module)
          , id = resolved[0]
          , filename = resolved[1]
        return tools.load(id,filename,module,tools.make,tools.cache)
      }
      
      function finishRequire(newRequire){
        newRequire.paths = resolve.modulePaths;
        newRequire.main = process.mainModule;
        // Enable support to add extra extension types
        newRequire.extensions = require.extensions;
        // TODO: Insert depreciation warning
        newRequire.registerExtension = require.registerExtension;
        newRequire.cache = tools.cache;
        return newRequire;
      }
    }

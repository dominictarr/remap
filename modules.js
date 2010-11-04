
  var path = require('path')
    , resolve = require('./resolve')

  exports.resolveModuleFilename = resolve.resolveModuleFilename

var internalModuleCache = {};

function useCache(moduleCache){

//    var extensions = {};
  var extensions = require.extensions


  // Set the environ variable NODE_MODULE_CONTEXTS=1 to make node load all
  // modules in thier own context.
  var contextLoad = false;
  if (+process.env["NODE_MODULE_CONTEXTS"] > 0) contextLoad = true;
  var Script;
  if (!moduleCache) { moduleCache = {}; }

  var registerExtension = function(){console.log('require.registerExtension() removed. Use require.extensions instead');}

  // *** module prototype *** 
  //the test of this is at the bottom...
  exports.Module = Module
  function Module (id, parent) {
    this.id = id;
    this.exports = {};
    this.parent = parent;

    this.filename = null;
    this.loaded = false;
    this.exited = false;
    this.children = [];//never gets set...
  };

  // This contains the source code for the files in lib/
  // Like, natives.fs is the contents of lib/fs.js
  
  /*
    *** some stuff for handling native modules ***
  
  */


  var natives = process.binding('natives'); //refactor this out to call require
    // remove this...>>>

  function loadNative (id) {
    var m = new Module(id);
    internalModuleCache[id] = m;
    var e = m._compile(natives[id], id+".js");
    if (e) throw e; // error compiling native module
    return m;
  }

  exports.requireNative = requireNative;

  function requireNative (id) {
    if (internalModuleCache[id]) return internalModuleCache[id].exports;
    if (!natives[id]) throw new Error('No such native module ' + id);
    return loadNative(id).exports;
  }

    // <<< remote this...

  // Modules

  var debug = require('./common').debug


  // The paths that the user has specifically asked for.  Highest priority.
  // This is what's hung on require.paths.
  /*
  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

    resolving modules... START
  */



/*
  resolve modules ends...
  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

*/

  exports.loadResolvedModule  = loadResolvedModule
  
  function loadResolvedModule (id,filename,parent,wrapper){
    // remote this...>>>
    var cachedNative = internalModuleCache[id];
    if (cachedNative) {
      return cachedNative;
    }
    if (natives[id]) {
      debug('load native module ' + request);
      return loadNative(id);
    }

    var cachedModule = moduleCache[filename];
    if (cachedModule) return cachedModule;
    // <<< remote this...
    
    var module = new Module(id, parent);

    moduleCache[filename] = module;
    module.requireWrapper = wrapper;//intercepts creation of require so it can me remapped.
    module.load(filename);

    return module;
  }

  exports.loadModule  = loadModule
  
  function loadModule (request, parent, wrapper) {
   // console.log("loadModule REQUEST  " + (request) + " parent: " + parent.id + " wrapper: " + wrapper);

    var resolved = resolve.resolveModuleFilename(request, parent);
    var id = resolved[0];
    var filename = resolved[1];
    //console.log("           RESOLVED  " + (id) + " filename: " + filename );

    // With natives id === request
    // We deal with these first
    
    return loadResolvedModule (id,filename,parent,wrapper)
  };

  function loadModuleExports (request, parent, wrapper) {

    if (natives[request]) {//usually, we want to load these from the main cache.
      return require(request)
    }
  
    return loadModule(request, parent, wrapper).exports;
  };

  
//resolveModuleFilename was here. moved into resolvein module section


  Module.prototype.load = function (filename) {
    debug("load " + JSON.stringify(filename) + " for module " + JSON.stringify(this.id));

    process.assert(!this.loaded);
    this.filename = filename;

    /*
      finish loading the module with the function for loading that extension type
      .. if .js it will call _compile()
    */

    var extension = path.extname(filename) || '.js'; 
    if (!extensions[extension]) extension = '.js';
    extensions[extension](this, filename);
    this.loaded = true;
  };
  
  exports.uncache = uncache
  exports.moduleCache = moduleCache
  
  function uncache(module){
    delete moduleCache[module.filename]
  }

  exports.makeRequire = makeRequire
    //modify loadModuleExports() to call require.resolve so that you can just modify that to get a change.
  
  function makeRequire(self){
    function require (path) {
      /*
        i'm compromising the design to keep the old interface.
        better to add a function that returns [id,filename]
      */

      var id = resolve.resolveModuleId(path,self)
        , filename = require.resolve(path)
        
      return loadResolvedModule (id,filename,self,self.requireWrapper).exports
//      return loadModuleExports(path, self,self.wrapRequire);//wrapRequire is the makeRequire which will be assigned to sub modules.
    }
    require.resolve = function newResolve (request) {
      return resolve.resolveModuleFilename(request, self)[1];
    }
    require.paths = resolve.modulePaths;
    require.main = process.mainModule;
    // Enable support to add extra extension types
    require.extensions = extensions;
    // TODO: Insert depreciation warning
    require.registerExtension = registerExtension;
    require.cache = moduleCache;
    return require;
  }

  // Returns exception if any
  Module.prototype._compile = function (content, filename) {
    var self = this;
    // remove shebang
    content = content.replace(/^\#\!.*/, '');

    
    var require = self.requireWrapper ? self.requireWrapper(makeRequire(self),self) : makeRequire(self);

    var dirname = path.dirname(filename);

    if (contextLoad) {
      if (!Script) Script = process.binding('evals').Script;

      if (self.id !== ".") {
        debug('load submodule');
        // not root module
        var sandbox = {};
        for (var k in global) {
          sandbox[k] = global[k];
        }
        sandbox.require     = require;
        sandbox.exports     = self.exports;
        sandbox.__filename  = filename;
        sandbox.__dirname   = dirname;
        sandbox.module      = self;
        sandbox.global      = sandbox;
        sandbox.root        = root;

        Script.runInNewContext(content, sandbox, filename);

      } else {
        debug('load root module');
        // root module
        global.require    = require;
        global.exports    = self.exports;
        global.__filename = filename;
        global.__dirname  = dirname;
        global.module     = self;
        Script.runInThisContext(content, filename);
      }

    } else {
      // create wrapper function
      var wrapper = "(function (exports, require, module, __filename, __dirname) { "
                  + content
                  + "\n});";

      var compiledWrapper = process.compile(wrapper, filename);
      if (filename === process.argv[1] && global.v8debug) {
        global.v8debug.Debug.setBreakPoint(compiledWrapper, 0, 0);
      }
      compiledWrapper.apply(self.exports, [self.exports, require, self, filename, dirname]);
    }
  };

/*
  extensions is a list of functions to handle different extensions.
  
  it's passed a (new?) module object, and a filename (absolute?)
  and orders the module to compile it.
  
  a user could pass a function without having access to Module
  and translate another language into js nad then have module 
  compile it...
  
  so... where is this called from?
*/

  // Native extension for .js
  extensions['.js'] = function (module, filename) {
    var content = require('fs').readFileSync(filename, 'utf8');
    module._compile(content, filename);
  };


  // Native extension for .node
  extensions['.node'] = function (module, filename) {
    process.dlopen(filename, module.exports);
  };


  // bootstrap main module.
  exports.runMain = function () {
    // Load the main module--the command line argument.
    process.mainModule = new Module(".");
    process.mainModule.load(process.argv[1]);
  };
  exports.useCache = useCache
  return exports;
}
module.exports = useCache({})

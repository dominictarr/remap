var internalModuleCache = {};

function useCache(moduleCache){

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


  var natives = process.binding('natives');

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


  // Modules

  var debugLevel = parseInt(process.env["NODE_DEBUG"], 16);
  function debug (x) {
    if (debugLevel & 1) {
      process.binding('stdio').writeError(x + "\n");
    }
  }

  var pathFn = process.compile("(function (exports) {" + natives.path + "\n})",
                               "path");
  // this is the path module,
  //since require isn't setup yet you have to load this funny way.
  var pathModule = createInternalModule('path', pathFn); 
  var path = pathModule.exports;
  
  function createInternalModule (id, constructor) {//only for internal node stuff... fs, http, etc.
    var m = new Module(id);
    constructor(m.exports);
    m.loaded = true;
    internalModuleCache[id] = m;
    return m;
  };


  // The paths that the user has specifically asked for.  Highest priority.
  // This is what's hung on require.paths.
  /*
  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

    resolving modules... START
  */
  var modulePaths = [];
  if (process.env.NODE_PATH) {
    modulePaths = process.env.NODE_PATH.split(":");
  }

  // The default global paths that are always checked.
  // Lowest priority.
  var defaultPaths = [];
  if (process.env.HOME) {
    defaultPaths.push(path.join(process.env.HOME, ".node_modules"));
    defaultPaths.push(path.join(process.env.HOME, ".node_libraries"));
  }
  defaultPaths.push(path.join(process.execPath, "..", "..", "lib", "node"));

  var extensions = {};

  // Which files to traverse while finding id? Returns generator function.
  function traverser (id, dirs) {
    var head = [], inDir = [], dirs = dirs.slice(),
        exts = Object.keys(extensions);
    return function next () {
      var result = head.shift();
      if (result) { return result; }//on first call result will be undefined

      var gen = inDir.shift();
      if (gen) { head = gen(); return next(); }//also null first time

      var dir = dirs.shift();//not necessarily null.
      if (dir !== undefined) {
        function direct (ext) { return path.join(dir, id + ext); }
        function index (ext) { return path.join(dir, id, 'index' + ext); }
        inDir = [
          function () { return exts.map(direct); },
          function () { return exts.map(index); }
        ];
        /*
        head will be assigned here, 
        so on second call head will be ok, 
        and inDir will be ok, so after that call,
        head will have ext.length values,
        if you get through all of those,
        gen will be called again, and you'll have ext values.
        
        so it only actually builds the list of possible paths as it goes
        doing a minimal amount of string and array manip, unless it's necessary
        
        the same could be done with two nested for in loops.
        */
        head = [path.join(dir, id)];
        return next();
      }
    };
  }

  // traverser is only called from findModulePath
  function findModulePath (request, paths) {
    var nextLoc = traverser(request, paths);

    var fs = requireNative('fs');

    var location, stats;
    while (location = nextLoc()) {
      try { stats = fs.statSync(location); } catch(e) { continue; }
      if (stats && !stats.isDirectory()) return location;
    }
    return false;
  }
  //who calls findModulePath? only resolveModuleFilename


/*
  modulePathWalk is a little strange... i havn't seen anyone using node_modules directories.
  it has the effect of adding ./node_modules to the path, ahead of the default paths.

*/
  function modulePathWalk (parent) {
    if (parent._modulePaths) return parent._modulePaths;
    var p = parent.filename.split("/");
    var mp = [];
    while (undefined !== p.pop()) {
      mp.push(p.join("/")+"/node_modules");
    }
    return parent._modulePaths = mp;
  }

  // sync - no i/o performed
  function resolveModuleLookupPaths (request, parent) {

    if (natives[request]) return [request, []];

    if (request.charAt(0) === '/') {
      return [request, ['']];
    }

    var start = request.substring(0, 2);
    if (start !== "./" && start !== "..") {
      var paths = modulePaths.concat(modulePathWalk(parent)).concat(defaultPaths);
      return [request, paths];//the more interesting case... search through the path.
    }

    // Is the parent an index module?
    // We can assume the parent has a valid extension,
    // as it already has been accepted as a module.
        var isIndex        = /^index\.\w+?$/.test(path.basename(parent.filename)),//check whether parent.filename is index.[EXTENSION]
        parentIdPath   = isIndex ? parent.id : path.dirname(parent.id),//the name that was require(name) to get parent module.
        id             = path.join(parentIdPath, request);//absolute path from the relative one.
        //if parent is an index, then it's id will be the name of the directory it is in.
        //and since it is relative, there is only be extentions.length places to look for the new file.

    // make sure require('./path') and require('path') get distinct ids, even
    // when called from the toplevel js file
    if (parentIdPath === '.' && id.indexOf('/') === -1) {
      id = './' + id;
    }
    debug("RELATIVE: requested:" + request + " set ID to: "+id+" from "+parent.id);
    return [id, [path.dirname(parent.filename)]];
  }
  exports.resolveModuleFilename = resolveModuleFilename
  function resolveModuleFilename (request, parent) {
    if (natives[request]) return [request, request];//fs http net, etc.
    var resolvedModule = resolveModuleLookupPaths(request, parent),
        id             = resolvedModule[0],
        paths          = resolvedModule[1];

    // look up the filename first, since that's the cache key.
    debug("looking for " + JSON.stringify(id) + " in " + JSON.stringify(paths));
    var filename = findModulePath(request, paths);
    if (!filename) {
      throw new Error("Cannot find module '" + request + "'");
    }
    return [id, filename];
  }

/*
  resolve modules ends...
  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

*/

  exports.loadModule  = loadModule
  
  function loadModule (request, parent, wrapper) {
    debug("loadModule REQUEST  " + (request) + " parent: " + parent.id + " wrapper: " + wrapper);

    var resolved = resolveModuleFilename(request, parent);
    var id = resolved[0];
    var filename = resolved[1];

    // With natives id === request
    // We deal with these first
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
    
    /*
      possibly, the way to do reloading is to use a special cache.
      rather than delete the reloaded module from the cache.
    
    */

    var module = new Module(id, parent);
    moduleCache[filename] = module;
    module.requireWrapper = wrapper;//intercepts creation of require so it can me remapped.
    module.load(filename);
    return module;
  };

/*  function loadModule (request, parent, wrapper) {
    return loadModule2(request, parent, wrapper).exports;
  };
*/
  
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
  
  function makeRequire(self){//also pass in mapping? or a function which may modify require...
    function require (path) {
      return loadModule(path, self,self.wrapRequire).exports;
    }
    /*
      which would need to be passed loadModule, 
      and assigned to the new Module so that _compile 
      can see it, after the extension method is called...
      
      hang on, if it is a property of a Module then loadModule can already see it
      since self is a Module.
      
      you could just create a new module, and then assign it a requireWrapper.
      
//      loadModule will copy self.requireWrapper to the new module 
      the Module constructor will copy requireWrapper from it's parent.
      
      or rather, will it need a copy method? (so it can decend the hierachy?)
    NO. in moduleWrapper this will -> the module, and so will know the parent,
    so it will be able to make a decision about what to copy.
      
      so to get started,
      you create a module2 = new Module, assign it's wrapper, 
      //loadModule(path,module2)
      
      hmm, maybe should pass requireWrapper into load module.
      
      then it is just
      modules = require('modules')
      modules.loadModule('id',module,wrapper).exports
      that assigns the wrapper to the module,
      then _compile calls it. which also gets to (re)define what it assigns to 
      the next require in submodules...

      yes that will work.
    */
    require.resolve = function (request) {
      return resolveModuleFilename(request, self)[1];
    }
    require.paths = modulePaths;
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

    
    var require = self.requireWrapper ? self.requireWrapper(makeRequire(self)) : makeRequire(self);

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
    var content = requireNative('fs').readFileSync(filename, 'utf8');
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

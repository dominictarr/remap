//module.js

module.exports = Module
  var extensions = require.extensions
    , path = require('path')
    , debug = require('./common').debug
    , contextLoad = false;
    
  if (+process.env["NODE_MODULE_CONTEXTS"] > 0) contextLoad = true;
  var Script;


  function Module (id, parent) {
    this.id = id;
    this.exports = {};
    this.parent = parent;

    this.filename = null;
    this.loaded = false;
    this.exited = false;
    this.children = [];//never gets set...
  };

  
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
  /*
    what is contextLoad for?
    
    might it be useful to be able to load in a context on a per-file basis?
  */

  // Returns exception if any
  Module.prototype._compile = function (content, filename) {
    var self = this;
    // remove shebang
    content = content.replace(/^\#\!.*/, '');

//    var newRequire = self.makeRequire ? self.makeRequire(self) : require('./make_require').makeRequire(self)//the cache has to get in here.
    //why not use assign require to module?

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
        sandbox.require     = self.require;
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
        global.require    = self.require;
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
      compiledWrapper.apply(self.exports, [self.exports, self.require, self, filename, dirname]);
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

/*
  // bootstrap main module.
  exports.runMain = function () {
    // Load the main module--the command line argument.
    process.mainModule = new Module(".");
    process.mainModule.load(process.argv[1]);
  };*/
//  exports.useCache = useCache


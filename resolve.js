
//  var modules
  var natives = process.binding('natives');
  var debug = require('./common').debug
  var path = require('path')

/*

this could be refactored quite a bit, so you don't have to pass in module 
(instead pass local dir) ... if it is a relative request

also, allow passing in custom paths,

also, many projects are in this form:

project/
  lib/
    project.js
    project/
      other.js
      etc.js

would be handy to handle this automaticially,
so when request('project'), look in lib, and then find 'project.js'
when request('project/other') 
find project/lib/project/other

feels like this may cause some complications, but it may be useful to get
git forks running automagicially.

*/

  var modulePaths = [];
  exports.modulePaths = modulePaths
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

  var extensions = Object.keys(require.extensions)
  //  exports.extensions = extensions

  // Which files to traverse while finding id? Returns generator function.
  function traverser (id, dirs,_extensions) {
    
    var head = [], inDir = [], dirs = dirs.slice(),
        exts = _extensions || extensions;
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
  function findModulePath (request, paths,_extensions) {
    var nextLoc = traverser(request, paths,_extensions);

    var fs = require('fs');

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
  
  exports.resolveModuleId = resolveModuleId
  
  function resolveModuleId (request,parent){

    if (natives[request]) return request;

    if (request.charAt(0) === '/') {
      return request;
    }

   var start = request.substring(0, 2);

    if (start !== "./" && start !== "..") {
      return request
    }
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
    return id
  }
  
  exports.resolveModuleLookupPaths = resolveModuleLookupPaths
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
    


    //here is a special case i think the main module gets the id '.'
        
    if (parentIdPath === '.' && id.indexOf('/') === -1) {
      id = './' + id;
    }
    debug("RELATIVE: requested:" + request + " set ID to: "+id+" from "+parent.id);
    return [id, [path.dirname(parent.filename)]];
  }

  exports.resolveModuleFilename = resolveModuleFilename
  function resolveModuleFilename (request, parent,_extensions) {
    if (natives[request]) return [request, request];//fs http net, etc.
    var resolvedModule = resolveModuleLookupPaths(request, parent),
        id             = resolvedModule[0],
        paths          = resolvedModule[1];

    // look up the filename first, since that's the cache key.
    debug("looking for " + JSON.stringify(id) + " in " + JSON.stringify(paths));
    var filename = findModulePath(request, paths,_extensions);
    if (!filename) {
//      console.log(extensions);
      throw new Error("Cannot find module '" + request + "', from: " + path.dirname(parent.filename));
    }
    return [id, filename];
  }



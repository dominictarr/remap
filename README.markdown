
#remap - reroute require for mocks, wrappers, or shenanigans#

open up node's module loading code and gives you control of what is happening.

##basic examples##

    var modules = require ('remap/modules')
      , require2 = modules.makeRequire(module) //must pass in your module.

    var x require2('path/to/module/x')
    
x is the same as if you loaded it with require()
x can load sub modules, and will see a require function. 
but it will be a require function created by remap.

makeRequire has a second argument, `makeRequire(module,tools)` which is a map
to functions to use for the main parts of require's task:

    { 
      //resolve: called before load. returns [id,path/to/module]
      resolve: function (request,_module){
        return resolve.resolveModuleFilename(request,_module)
      }//_module is module doing the requesting.
      
      //load: returns the new module's exports. insert mocks & wrappers here.
    , load: function (id, filename, parent, makeRequire,cache) {
        return modules.defaultLoad(id,filename,parent,makeRequire)
      }

      //make: is called by default load, should return a new makeRequire 
      //that will be used by children of newModule.
    , make: function (newModule){
        //returns a makeRequire function for the newly loaded module
        return modules.makeMake(newModule, tools)
      }
    }

also, there is remap/remapper, which eases the pain for some tasks:

    var remapper = new Remapper(module,{
      'path/module-a':'newpath/module-b' 
    //, ...
    })
    remapper.require('path/module-a') // will load 'newpath/module-b' instead.
    
remapper can also tell you the dependency tree of the module's it's loaded.

    remapper.depends
    
this was composed by copy/pasting from github.com/ry/node/src/node.js and spliting it into multiple modules, adding exports, refactoring, testing and adding as little as possible.

I'll be the first to admit that alot of the code in here is a bit ugly, 
and further development will be forth coming...


//remapper

var modules = require('remap/modules')
  , resolve = require('remap/resolve')
  , log = console.log
  , inspect = require('inspect')
module.exports = Remapper


function Remapper (_module,remaps){
  var self = this
  modules = modules.useCache({})
  
function Maker (depends,loaded,remaps){
  var self = this
  var _depends = {}
    loaded = loaded || {}

  self.resolve = function (request,module){
    if(remaps.hasOwnProperty(request) && remaps[request]){
      request = remaps[request]
    }
    var resolved = resolve.resolveModuleFilename(request,module)
    //log(resolved[0])
    
    //if the remap is absolute, it may need to be re-resolved.
    
    if(remaps.hasOwnProperty(resolved[0]) && remaps[resolved[0]])
      return resolve.resolveModuleFilename(remaps[resolved[0]],module)

    return resolved
  }

  self.load = function (id, filename, parent, makeR ){

    if(!loaded[id]) { loaded[id] = {} }

    if(loaded[parent.id]) { loaded[parent.id][id] = loaded[id] }

    return modules.defaultLoad(id, filename, parent, makeR)
  }

  self.make = function (thisModule){
    var id = thisModule.id
    depends[id] = loaded[id]
    
    return modules.makeMake(new Maker(loaded[id],loaded,remaps))(thisModule)  
  }
}

 /**
  * the dependencies loaded through require.
  *
  * depends is easier to spell than dependencies
  */

  self.depends = {} //the 
  self.loaded = {} //the 
  self.remaps = remaps || {} //the 

  self.require = make()

  function make(){
    return modules.makeMake(new Maker(self.depends,self.loaded,self.remaps))(_module)
  }

}

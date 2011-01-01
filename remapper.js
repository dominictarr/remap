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
    /*
      when a file is loaded,
    */

    if(!loaded[id]) { loaded[id] = {} }
      //if this is the first time the module is loaded, 
      //it will not have a record yet.
      
      //wait untill defaultLoad returns, make will have created the record.


    if(loaded[parent.id]) { loaded[parent.id][id] = loaded[id] }

    return modules.defaultLoad(id, filename, parent, makeR)
    //check that loaded[id] exists, and
    //set loaded[parent.id][id] = loaded[id]

    //why didn't I do it like this the first time?
  }

  self.make = function (thisModule){
    var id = thisModule.id
    depends[id] = loaded[id]
    //when a file is first loaded,
    //create an empty record in loaded under thisModule.id
    //there should not already be a record there.
    
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

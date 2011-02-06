//remapper

var modules = require('remap/modules')
  , resolve = require('remap/resolve')
  , log = require('logger') //console.log
  , assert = require('assert')

module.exports = Remapper

function Remapper (_module,remaps){
  var self = this
  modules = modules.useCache({})
  
//to get NpmRemapper, probably best to just rewrite this.
  
function Maker (depends,loaded,remaps){
  var self = this
  var _depends = {}
    loaded = loaded || {}

  self.resolve = function (request,module){
    if(remaps.hasOwnProperty(request) && remaps[request]){
      request = remaps[request]
    }
    var resolved = resolve.resolveModuleFilename(request,module)

    if(remaps.hasOwnProperty(resolved[0]) && remaps[resolved[0]])
      return resolve.resolveModuleFilename(remaps[resolved[0]],module)

    return resolved
  }

  self.load = function (id, filename, parent, makeR ){
    var newModule = modules.defaultLoad(id, filename, parent, makeR)

    if(!loaded[id])
      loaded[id] = {} //should only happen when it's a native module

      assert.notEqual(loaded[parent.id],null, "SHOULD have record for parent " + parent.id + "")
      loaded[parent.id][id] = loaded[id]

    return newModule
  }

  self.make = function (thisModule){
   var id = thisModule.id
    loaded[id] = {}
    
    return modules.makeMake(new Maker(loaded[id],loaded,remaps))(thisModule)  
  }
}

 /**
  * the dependencies loaded through require.
  *
  * depends is easier to spell than dependencies
  */

  self.depends = {} 
  self.depends[_module.id] = {}
  self.loaded = {}
  self.remaps = remaps || {}

  self.loaded[_module.id] = self.depends[_module.id]
  self.require = make()

  function make(){
    return modules.makeMake(new Maker(self.depends[_module.id],self.loaded,self.remaps))(_module)
  }

}


var inspect = require('util').inspect
, path = require('path')
, fs = require('fs');

module.exports = makeRemap

function makeRemap (baseid){
  
  var extensions = ['.js','.node','/index.js','/index.node']
  var __here = path.dirname(baseid ? baseid : module.parent.id === 'remap' ? module.parent.parent.filename : module.parent.filename)
  var maps = {}

  function remap (id){
    return require(remap.resolve(id))
  }

  function resolveExtension(longId){
    for (i in extensions) {
       try{
       var id = longId + extensions[i]
       file = fs.openSync(id,'r')
       return id
       } catch (err){
        throw err
       }
    }
  }

  remap.resolve = function(id){
//    console.log("resolve(" + id + ")");
//    console.log("maps:" + inspect(maps));

    if (maps[id]){
      id = maps[id]
    }
    return path.join(__here,id + ".js")
      
    //return require.resolve(id);
  }
  function merge(big,inject){
    for (i in inject){
      big[i] = inject[i]
    }
    return big
  }
  remap.remap = function (mappings){
    merge(maps,mappings)
  }

  return remap
}

//console.log('require:\n' + inspect(require,false,5))
/*console.log('module:\n' + inspect(module,false,2))
console.log(inspect(__filename))
console.log(inspect(__dirname))*/


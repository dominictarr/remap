
var resolve = require('remap/resolve')
  , path = require('path')

exports ['resolve.resolveModuleFilename gets the filename and the id of a request'] = function (test){

  var resolved = {}
  
  resolved.a = resolve.resolveModuleFilename('./.examples/a', module)
  resolved.remap_a = resolve.resolveModuleFilename('remap/test/.examples/a', module)
  resolved.remap = resolve.resolveModuleFilename('remap', module)
  
  test.finish()
}


exports ['resolve.resolveModuleLookupPaths gets the id and paths of a request'] = function (test){

  var resolved = {}
  
  resolved.a = resolve.resolveModuleLookupPaths('./.examples/a', module)
  resolved.remap_a = resolve.resolveModuleLookupPaths('remap/test/.examples/a', module)
  resolved.remap = resolve.resolveModuleLookupPaths('remap', module)
  
  test.finish()
}

exports ['resolve.resolveModuleId gets the id of request'] = function (test){

  checkResolvedId('./.examples/a')
  checkResolvedId('remap/test/.examples/a')
  checkResolvedId('remap')
  checkResolvedId('fs')
  checkResolvedId(require.resolve('./.examples/a'))//will generate a absolute filename, 
  
  function checkResolvedId(request){
    var resolved = resolve.resolveModuleFilename(request, module)
      , id = resolve.resolveModuleId(request,module)
      
      test.equal(id,resolved[0])
  }
  
  test.finish()
}

exports ['resolve can be passed extensions to look for'] = function (test){

   var jsonFile = resolve.resolveModuleFilename('./.examples/json', module, ['.json'])   
     , expected = path.join(__dirname,'./.examples/json.json')
     , xFile = resolve.resolveModuleFilename('./.examples/x', module, ['.x'])   
     , expected2 = path.join(__dirname,'./.examples/x.x')

   test.equal(jsonFile[1], expected)
 
   test.equal(xFile[1], expected2)
 
   test.finish()
}


var resolve = require('remap/resolve');

exports ['resolve.resolveModuleFilename gets the filename and the id of a request'] = function (test){

  var resolved = {}
  
  resolved.a = resolve.resolveModuleFilename('./.examples/a', module)
  resolved.remap_a = resolve.resolveModuleFilename('remap/test/.examples/a', module)
  resolved.remap = resolve.resolveModuleFilename('remap', module)
  console.log(resolved)
  
  test.finish()
}


exports ['resolve.resolveModuleLookupPaths gets the id and paths of a request'] = function (test){

  var resolved = {}
  
  resolved.a = resolve.resolveModuleLookupPaths('./.examples/a', module)
  resolved.remap_a = resolve.resolveModuleLookupPaths('remap/test/.examples/a', module)
  resolved.remap = resolve.resolveModuleLookupPaths('remap', module)
  console.log(resolved)
  
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

var resolve = require('remap/resolve')
  , log = console.log
  , path = require('path')
exports['Resolver() creates instance of Resolver'] = function (test){
  var r = resolve.Resolver()

  test.ok(r instanceof resolve.Resolver,"expected instance of Resolver, got :" + r)
  test.finish()
}

exports['Resolver can be initialised with extensions and paths'] = function (test){

  var opts = 
        { parent: module
        , paths: [__dirname]
        , extensions: ['.js']
        }
   ,  r = resolve.Resolver(opts)
   
   test.equal(r.parent, module)
   test.deepEqual(r.paths, [__dirname])
   test.deepEqual(r.extensions, ['.js'])

   test.finish()
}

exports ['Resolver can resolve this file, same as require.resolve'] = function (test){
  var r = resolve.Resolver({parent: module})
    , r2 = resolve.Resolver({paths:[]})
    , r3 = resolve.Resolver({paths:[__dirname]})
    , files = 
        ['./resolve.resolver.asynct'
        ,'../index'
        ,'remap']
   test.deepEqual(r2.paths, [])
    
  files.forEach(function(e){
    test.equal(r.resolve(e)[1],require.resolve(e))

    test.throws(function(){test.equal(r2.resolve(e)[1],null)})

    test.equal(r3.resolve(e)[1],require.resolve(e))
  });

  //but not if there are no paths

  test.finish()
}


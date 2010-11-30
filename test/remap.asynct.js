
/*
  okay, sleep, then wakeup and write 
  thing which pulls out all the dependencies
  and can stick new stuff in.
  
  extracting all the dependencies will be a good test.
  
*/

var remapper = require('remap')//.remapper(__filename)

exports['Change what require will resolve'] = function(test){
    var remap = remapper()
    test.ok(remap.resolve,'remap has resolve function')
    
    test.equal(require.resolve('./.examples/a')
      , __dirname + '/' +'.examples/a.js')
    test.equal(remap.resolve('./.examples/a')
      , __dirname + '/' + '.examples/a.js')

    remap.remap({'./.examples/a':'./.examples/a2'}) //tell remap to use a different module.
    
    test.equal(remap.resolve('./.examples/a'),require.resolve('./.examples/a2'))
    
    test.finish()
}

exports['load two different modules through one name by remapping'] = function (test){
    var remap = remapper()
    
    test.equal(remap.resolve('./.examples/a'),__dirname + '/' + '.examples/a.js')
    a1 = remap('./.examples/a')
    test.equal(a1.a(),'A is for Apple');
    remap.remap({'./.examples/a':'./.examples/a2'}) 
      //tell remap to use a different module.
    a2 = remap('./.examples/a')
    test.equal(a2.a(),'A is for Aardvark');
  
    test.finish()
}

exports['remap at depth'] = function (test){
    var remap = remapper()

    test.equal(remap.resolve('./.examples/b'),__dirname + '/' + '.examples/b.js')
  
    remap.remap({'./.examples/c':'./.examples/a'}) 

    test.equal(remap.resolve('./.examples/c'),__dirname + '/' + '.examples/a.js')

    b = remap('./.examples/b')

    test.equal(b.b(),'B is for Banana');
    test.equal(b.next().a(),'A is for Apple');

/*    remap.remap({'./.examples/a':'./.examples/a2'}) 
      //tell remap to use a different module.
    a2 = remap('./.examples/a')
    test.equal(a2.a(),'A is for Aardvark');
  */
    test.finish()
}


/*AMBITIONS

-hierachical remapping
var remaps =   
  { 
    'a':'thisA'
  , 'b':
    { '.': 'thisB'
    , 'dependency_of_b':'a_different_implementation'
    }
  }
remap.remap(remaps)

specify a regular expression, or some sort of wild card to you can redirect a set of mappings...

remap to git repositories.
*/

/*exports ['provide a new require for submodules'] = function (test){
  test.ok(false,"TEST NOT YET IMPLEMENTED")
  test.finish();

}*/


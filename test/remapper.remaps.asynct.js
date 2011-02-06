//remapper.asynct

/*
  my javascript style has come a long way since I wrote the rest of this package.
  time to refactor soon!
  
  todo: may want to be able to inject a remap into a specific point.
  use different versions of the same module in different places. 
    -- probably not necessary for a whiles yet
    
  i think this is ready to stick into meta-modular/multi_test now.  
    
*/

var Remapper = require('remap/remapper')
  , describe = require('should').describe
  , helper = require('./.helper/helper')
  , inspect = require('sys').inspect //require('inspect')
  , traverser = require('traverser')
  , a_fn = 'remap/test/.examples/a'
  , b_fn = 'remap/test/.examples/b'
  , c_fn = 'remap/test/.examples/c'
  , e_fn = 'remap/test/.examples/e'
  , remapHelp = require('remap/test/.helper/remap-helper')

function getRemapper(remaps){
  var r = new Remapper(module,remaps)
  
  var it = 
    describe(r,"a Remapper instance")

  it.should.have.property('require').a('function')
  it.should.have.property('depends')

  return r
}


function doRemap (root,remaps,depends){
    var r = getRemapper(remaps)
      r.require(root)

    remapHelp.shouldRemap (r, root,remaps,depends)
}
function deps(depends){
var d = {}  
  d[module.id] = depends
  return d
}


exports ['can remap the dependencies of a single require() simple'] = function (test){
  var remaps = {'remap/test/.examples/a': 'remap/test/.examples/a2' }
    , r = getRemapper(remaps)
    , a = r.require(a_fn)

  helper.test_a2(a,test)  

  var depends = deps({'remap/test/.examples/a2': {} })
  var loaded = remapHelp.branches(depends)

  remapHelp.shouldDepends(r,'remap/test/.examples/a2',depends,loaded)

  test.finish()
}


exports ['can remap the dependencies of a single require()'] = function (test){
  var single = remapHelp.examples.single

  doRemap(single.root,single.remaps,deps(single.depends))

  test.finish()
}

exports ['can remap the dependencies of multiple require()s '] = function (test){
  var multiple = remapHelp.examples.multiple

  doRemap(multiple.root,multiple.remaps,deps(multiple.depends))

  doRemap(multiple.root,multiple.remapsAbs,deps(multiple.depends))

  test.finish()
}

exports ['can remap the dependencies of multiple require()s (more complex) '] = function (test){
  var complex = remapHelp.examples.complex

  doRemap(complex.root,complex.remaps,deps(complex.depends))

  doRemap(complex.root,complex.remapsAbs,deps(complex.depends))

  test.finish()
}

exports['can remap the dependencies of multiple require()s (more complex) more than once']
 = function (test) {

  var complex2 = remapHelp.examples.complex2

  doRemap(complex2.root, complex2.remaps, deps(complex2.depends))
  doRemap(complex2.root, complex2.remapsAbs, deps(complex2.depends))

  test.finish()
}

/**/

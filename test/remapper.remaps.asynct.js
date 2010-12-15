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
  , inspect = require('util').inspect //require('inspect')
  , log = console.log
  , a_fn = 'remap/test/.examples/a'
  , b_fn = 'remap/test/.examples/b'
  , c_fn = 'remap/test/.examples/c'
  , e_fn = 'remap/test/.examples/e'
  
function getRemapper(remaps){
  var r = new Remapper(module,remaps)
  
  var it = 
    describe(r,"a Remapper instance")

  it.should.have.property('require').a('function')
  it.should.have.property('depends')

  return r
}
function shouldDepends(r,fn,depends,loaded){
  var it = 
    describe(r.depends,'the dependencies of \'' + fn + '\'')
    it.should.have.key(fn)
    it.should.eql(depends)

  var it = 
    describe(r.loaded,'modules loaded under \'' + fn + '\'')
    it.should.eql(loaded)
}


exports ['can remap the dependencies of a single require()'] = function (test){
  var remaps = {'remap/test/.examples/a': 'remap/test/.examples/a2' }
    , r = getRemapper(remaps)
    , a = r.require(a_fn)

  helper.test_a2(a,test)  

  var depends = {'remap/test/.examples/a2': {} }
  var loaded = depends

  shouldDepends(r,'remap/test/.examples/a2',depends,loaded)

  test.finish()
}

exports ['can remap the dependencies of multiple require()s'] = function (test){

  var remaps = {'./c': './a' }
    , r = getRemapper(remaps)
    , b = r.require(b_fn)

  var depends = 
    {'remap/test/.examples/b': 
      {'remap/test/.examples/a': {} } }

  var loaded = 
    { 'remap/test/.examples/b': {'remap/test/.examples/a': {} } 
    , 'remap/test/.examples/a': {} }

  var it = 
    describe(r.depends,'the dependencies of \'' + b_fn + '\'')
    it.should.eql(depends)

  shouldDepends(r,b_fn,depends,loaded)

  test.finish()
}

/*
  make a more interesting tree-like example...
  
*/

function shouldLoaded(r,fn,loaded){
  describe(r.loaded, "loaded modules")
    .should.have.property(fn)
  describe(r.loaded[fn], "loaded modules under " + fn)
    .should.eql(loaded)
}

exports ['can remap the dependencies of multiple require()s (more complex)'] = function (test){

  var remaps = { './a': './b' }
    , r = getRemapper(remaps)
    , e = r.require(e_fn)

  var b,c,d,e
  var depends = 
  { 'remap/test/.examples/e':
    e = { 'remap/test/.examples/b': b = { 'remap/test/.examples/c': c = {} }
    , 'remap/test/.examples/d': 
      d = { 'remap/test/.examples/b': b } 
    , 'remap/test/.examples/b': b
       } }

  var loadedIds = 'bcde'.split('').map( function (t) {return 'remap/test/.examples/' + t}).sort()

  var loaded =  //too complicated to test all at once.
  { 'remap/test/.examples/e': e 
  , 'remap/test/.examples/d': d
  , 'remap/test/.examples/b': b
  , 'remap/test/.examples/c': c }

  var it = 
    describe(Object.keys(r.loaded).sort(),'module ids loaded under \'' + e_fn + '\'')
      it.should.eql(loadedIds)

  shouldLoaded(r,'remap/test/.examples/c',c)
  shouldLoaded(r,'remap/test/.examples/b',b)
  shouldLoaded(r,'remap/test/.examples/d',d)
  shouldLoaded(r,'remap/test/.examples/e',e)

  shouldDepends(r,e_fn,depends,loaded)

  test.finish()
}
/**/
exports ['can remap the dependencies of multiple require()s (more complex) more than once'] = function (test){

  var remaps = 
        { './a': './b' 
        , './c': './a2' }
    , r = getRemapper(remaps)
    , e = r.require(e_fn)

  var b,a2,d,e
  var depends = 
  { 'remap/test/.examples/e':
    e = { 'remap/test/.examples/b': b = { 'remap/test/.examples/a2': a2 = {} }
    , 'remap/test/.examples/d': 
      d = { 'remap/test/.examples/b': b } 
    , 'remap/test/.examples/b': b
       } }

  var loadedIds = ['b','d','e','a2'].map( function (t) {return 'remap/test/.examples/' + t}).sort()

  var loaded =  //too complicated to test all at once.
  { 'remap/test/.examples/e': e 
  , 'remap/test/.examples/d': d
  , 'remap/test/.examples/b': b
  , 'remap/test/.examples/a2': a2 }

  var it = 
    describe(Object.keys(r.loaded).sort(),'module ids loaded under \'' + e_fn + '\'')
      it.should.eql(loadedIds)

  shouldLoaded(r,'remap/test/.examples/a2',a2)
  shouldLoaded(r,'remap/test/.examples/b',b)
  shouldLoaded(r,'remap/test/.examples/d',d)
  shouldLoaded(r,'remap/test/.examples/e',e)

  shouldDepends(r,e_fn,depends,loaded)

  test.finish()
}
/**/


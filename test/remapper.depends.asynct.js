//remapper.asynct

/*
  my javascript style has come a long way since I wrote this pacakge.
  time to refactor soon!
*/

var Remapper = require('remap/remapper')
  , describe = require('should').describe
  , helper = require('./.helper/helper')
  , inspect = require('util').inspect //require('inspect')
  , log = require('logger')  
  , a_fn = 'remap/test/.examples/a'
  , b_fn = 'remap/test/.examples/b'
  , c_fn = 'remap/test/.examples/c'
  , e_fn = 'remap/test/.examples/e'
function getRemapper(){
  var r = new Remapper(module)
  
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


exports ['can retrive the dependencies of a single require()'] = function (test){

  var r = getRemapper()
    , a = r.require(a_fn)

  helper.test_a(a,test)  

  var depends = {'remap/test/.examples/a': {} }
  var loaded = depends

  shouldDepends(r,a_fn,depends,loaded)

  test.finish()
}



exports ['can retrive the dependencies of multiple require()s'] = function (test){

  var r = getRemapper()
    , b = r.require(b_fn)

  helper.test_b(b,test)  

  var depends = 
    {'remap/test/.examples/b': 
      {'remap/test/.examples/c': {} } }

  var loaded = 
    { 'remap/test/.examples/b': {'remap/test/.examples/c': {} } 
    , 'remap/test/.examples/c': {} }

  var it = 
    describe(r.depends,'the dependencies of \'' + b_fn + '\'')
    it.should.eql(depends)

  shouldDepends(r,b_fn,depends,loaded)

  log(r.depends)

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

exports ['can retrive the dependencies of multiple require()s (more complex)'] = function (test){

  var r = getRemapper()
    , e = r.require(e_fn)

  var a,b,c,d,e
  var depends = 
  { 'remap/test/.examples/e':
    e = { 'remap/test/.examples/a': a = {} 
    , 'remap/test/.examples/d': 
      d = { 'remap/test/.examples/a': a } 
    , 'remap/test/.examples/b': 
      b = { 'remap/test/.examples/c': c = {} } } }

  var loadedIds = 'abcde'.split('').map( function (t) {return 'remap/test/.examples/' + t}).sort()

  var loaded =  //too complicated to test all at once.
  { 'remap/test/.examples/e': e 
  , 'remap/test/.examples/a': a 
  , 'remap/test/.examples/d': d
  , 'remap/test/.examples/b': b
  , 'remap/test/.examples/c': c }

  var it = 
    describe(Object.keys(r.loaded).sort(),'module ids loaded under \'' + e_fn + '\'')
      it.should.eql(loadedIds)

  shouldLoaded(r,'remap/test/.examples/c',c)
  shouldLoaded(r,'remap/test/.examples/b',b)
  shouldLoaded(r,'remap/test/.examples/a',a)
  shouldLoaded(r,'remap/test/.examples/d',d)
  shouldLoaded(r,'remap/test/.examples/e',e)

  log('depends\n',r.depends)
    

  shouldDepends(r,e_fn,depends,loaded)

  test.finish()
}
/**/


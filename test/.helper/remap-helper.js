//remap-helper.js

exports.shouldLoaded = shouldLoaded
exports.shouldDepends = shouldDepends
exports.shouldRemap = shouldRemap
exports.branches = branches

var a_fn = 'remap/test/.examples/a'
  , b_fn = 'remap/test/.examples/b'
  , c_fn = 'remap/test/.examples/c'
  , e_fn = 'remap/test/.examples/e'
  , describe = require('should').describe
  , inspect = require('util').inspect //require('inspect')
  , traverser = require('traverser/traverser2')


function branches(depends){
var loaded = {}
 traverser(depends, {branch: branch})
  
  function branch(p){
    if(p.key != null){
      if(!loaded[p.key])
        loaded[p.key] = p.value
    }
    p.each()
  }
return loaded
}

function shouldLoaded(r,fn,loaded){
  describe(r.loaded, "loaded modules")
    .should.have.property(fn)
  describe(r.loaded[fn], "loaded modules under " + fn)
    .should.eql(loaded)
}

function shouldDepends(r,fn,depends,loaded){
  var it = 
    describe(r.depends,'the dependencies of \'' + fn + '\'')
    it.should.eql(depends)

  var it = 
    describe(r.loaded,'modules loaded under \'' + fn + '\'')
    it.should.have.property(fn)
    it.should.eql(loaded)
}

function shouldRemap (r, root,remaps,depends){

  var loaded = branches(depends)
    , loadedIds = Object.keys(loaded).sort()

  var it = 
    describe(Object.keys(r.loaded).sort(),'module ids loaded under \'' + root + '\'')
      it.should.eql(loadedIds)

  loadedIds.forEach(function (x){
    shouldLoaded(r,x,loaded[x])
  })

  shouldDepends(r,remaps[root] || root,depends,loaded)
}

var a,b,c,d,e

var examples = 
{ single:
  { root : a_fn
  , remaps: {'remap/test/.examples/a': 'remap/test/.examples/a2' }
  , depends: {'remap/test/.examples/a2': {} } }
, multiple:
  { root: b_fn
  , remaps: {'./c': './a' }
  , remapsAbs: {'remap/test/.examples/c': 'remap/test/.examples/a' }
  , depends: 
    {'remap/test/.examples/b': 
      {'remap/test/.examples/a': {} } } }
, complex:
  { root: e_fn
  , remaps: { './a': './b' }
  , remapsAbs: {'remap/test/.examples/a': 'remap/test/.examples/b' }
  , depends: 
      { 'remap/test/.examples/e':
      e = { 'remap/test/.examples/b': b = { 'remap/test/.examples/c': c = {} }
      , 'remap/test/.examples/d': 
        d = { 'remap/test/.examples/b': b } 
      , 'remap/test/.examples/b': b
             } } }
, complex2:
  { root: e_fn
  , remaps: 
    { './a': './b' 
    , './c': './a2' }
  , remapsAbs: 
    { 'remap/test/.examples/a': 'remap/test/.examples/b' 
    , 'remap/test/.examples/c': 'remap/test/.examples/a2' }
  , depends: 
    { 'remap/test/.examples/e':
      e = { 'remap/test/.examples/b': b = { 'remap/test/.examples/a2': a2 = {} }
      , 'remap/test/.examples/d': 
        d = { 'remap/test/.examples/b': b } 
      , 'remap/test/.examples/b': b
         } } } }

exports.examples = examples



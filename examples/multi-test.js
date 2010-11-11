/*
natural passes test/natural.asynct, but fails test/natural.random.asynct
natural2 passes test/natural.asynct, and test/natural.random.asynct

*/


if(module.main === module){
  run!
}

var asynct = require('asynct_testing')
  , cache = {}
  , modules = require('remap/modules').useCache(cache)



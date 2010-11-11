//number sequence
var natural = require('remap/examples/natural2')
exports['n() gives natual numbers'] = function (test){
  for (i = 0; i < 100; i ++){
    m = Math.round(Math.random() * 1000)
    test.equal(natural.n(m),m)
  }
  test.finish()
}

//this is so trivial... guess it's a sign i'm not in a coding mood.

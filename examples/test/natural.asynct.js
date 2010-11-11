//number sequence
var natural = require('remap/examples/natural')
exports['n() gives natual numbers'] = function (test){
  test.equal(natural.n(1),1)
  test.equal(natural.n(2),2)
  test.equal(natural.n(3),3)
  test.finish()
}

//this is so trivial... guess it's a sign i'm not in a coding mood.

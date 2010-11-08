//make_require
function test_a (a,test){
    test.equal(a.a(), "A is for Apple")
    test.equal(a.version, "v0.0.0")
    test.equal(a.__filename, require.resolve('../.examples/a'))
}
function test_b (b,test){
    test.equal(b.b(), "B is for Banana")
    test.equal(b.next(), "C is for Chicken")
}

function looksLikeRequire(r,test){
  var types = 
    { resolve: 'function'
    , paths:  'object'
    , extensions: 'object'
    , registerExtension: 'function'
    , cache:   'object'
    , main:  'object'
    }
    
    for (i in types){
      test.equal(typeof r[i], types[i], "typeof :'" + r + '.'  + i + ' should be: ' + types[i] + ', but was: ' +  typeof r[i])
    }
}


module.exports = {
  test_a: test_a
, test_b: test_b
, looksLikeRequire: looksLikeRequire
}

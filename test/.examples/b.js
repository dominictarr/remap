//b.js

c = require('./c')

exports.b = function (){
  return "B is for Banana"
}

exports.next = c.c

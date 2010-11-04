/*
  this file will export one random number, 
  for all the requires which load it, 
  unless it's loaded into a new cache.
*/

var oneRandom = Math.random(1000)
exports.oneRandom = function(){
  return oneRandom;
}

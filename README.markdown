
#Remap - reroute require for mocks, wrappers, or shenanigans#

this module allows you to modify the behaviour of require so that you can

1. redirect require.resolve so a request may return a different module
2. modify loading so that you can return a mock, or a modify/wrap a module.
3. control the behaviour of require at different levels of depth...
4. load modules into a new cache, so the same module can be loaded multiple times. for example, run a test multiple times with different implementations of specific dependencies each time.

this is largely composed by copy/pasting from github.com/ry/node/src/node.js and spliting it into multiple modules, adding exports, refactoring, testing and adding as little as possible!

this is still very hacky! 

thanks for reading.


|||||||||||||||||||

okay, written a simple multi tester, which takes a test, it's target, and a candidate... 
it runs the candidate through the test and calls back with the result.

I'll split this out into another module, which depends on remap

I'll need a manifest file which defines the targets of each test, 
(and which test format they use...eventually)

and a package.json which defines which tests files need to pass.

i.e something somewhere needs to say that natural2 should pass natural.asynct & natural.random.asynct

currently, that will mean that you have to say what tests dependencies must pass.

tests -> target

module.dependency -> tests

temp, well need a list of tests each module is intended to pass, but later we'll just check thier interface...





/*
some module loading ...

> rm = new module.constructor('rm',module)
> rm.load('/home/dominic/code/node/remap/test/./remap.asynct.js')
> rm.exports
{ 'Change what require will resolve': [Function],
  'load two different modules through one name by remapping': [Function] }

...will have to drag out the module code though, and open it up a little...

hell, can even assign what i like to 

require.cache

>require.cache[rm.filename] = rm

this is what I came here for.

*/

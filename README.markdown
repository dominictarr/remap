
#Remap - reroute require for mocks, wrappers, or shenanigans#

this module allows you to modify the behaviour of require so that you can

1. redirect require.resolve so a request may return a different module
2. modify loading so that you can return a mock, or a modify/wrap a module.
3. control the behaviour of require at different levels of depth...
4. load modules into a new cache, so the same module can be loaded multiple times. for example, run a test multiple times with different implementations of specific dependencies each time.

this is largely composed by copy/pasting from github.com/ry/node/src/node.js and spliting it into multiple modules, adding exports, refactoring, testing and adding as little as possible!

this is still very hacky! 

thanks for reading.


------------------------

next: i want to refactor out useCache, as new modules functions are created each time you call modules.useCache({})

modules and make_require are both depending on each other, and they both need to share the cache.

maybe they should be in just one file?
  - modules is already too large.
maybe cache should be passed around as arguments?
  - that doesn't feel right either... there must be a better answer.
  - maybe there is a more natural split between modules and make_require...
    what if make_require was loading

YUSS! if i move the loadModule functions out of modules this tangle should sort itself.


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


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

next: rewrite make_require to use modules.

    I had originally had useCache in both files which was messy.
    refactored, so cache is passed around in make_require, but wrapped in modules

    i realise now that I wasn't that far off an elegant solution.
    
    passing cache every where is ugly too, and modules is basicially an object 
    (you call a function that creates state) moving Module out was good,
    
    but i'll get much nice function arguments for puting it all into an object which i 
    initialize with cache, module, and makeRequire
    
    new Loader(module,cache).setMake(loader.makeRequire())... maybe the gain isn't that great.
    
    is that the lesson here? if your passing around the same arguments around
    a set of functions, encaspulate it with state (i.e, an object)

    eitherway, i'll try using it for something first! and _then_ rewrite it.

    simpler test for make_require
        
  



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

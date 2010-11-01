
#Remap - reroute require for mocks, wrappers, or shenanigans#






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

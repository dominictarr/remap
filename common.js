//common

  var debugLevel = parseInt(process.env["NODE_DEBUG"], 16);
  exports.debug = debug
  function debug (x) {
    if (debugLevel & 1) {
      process.binding('stdio').writeError(x + "\n");
    }
  }


# Wrap a function in a `setTimeout` call. This is used to guarantee async
# behavior, which can avoid unexpected errors.

delay = (fn) ->
  (args...) ->
    newFunc = -> fn args...
    setTimeout newFunc, 0
    return

module.exports = delay

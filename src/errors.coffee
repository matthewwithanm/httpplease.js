class HttpError extends Error
  name: 'HttpError'
  constructor: (@message) ->


createError = (message, xhr) ->
  err = new HttpError message
  err.status = xhr.status or 0
  err.xhr = xhr
  err


module.exports = {HttpError, createError}

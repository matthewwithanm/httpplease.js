class HttpError extends Error
  name: 'HttpError'
  constructor: (@message) ->


createError = (message, request) ->
  err = new HttpError message
  xhr = request.xhr
  err.request = request
  err.status = xhr.status or 0
  err.xhr = xhr
  err


module.exports = {HttpError, createError}

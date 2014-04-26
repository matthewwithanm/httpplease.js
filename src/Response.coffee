
class Response
  constructor: (xhr) ->
    @xhr = xhr
    @status = xhr.status or 0
    @text = xhr.responseText


module.exports = Response

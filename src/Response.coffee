
class Response
  constructor: (req) ->
    @request = req
    @xhr = req.xhr
    @status = @xhr.status or 0
    @text = @xhr.responseText


module.exports = Response

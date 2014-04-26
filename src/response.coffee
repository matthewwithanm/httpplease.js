
class Response
  constructor: (req) ->
    xhr = req.xhr
    @request = req
    @xhr = xhr
    @status = xhr.status or 0
    @text = xhr.responseText
    @contentType = xhr.contentType or xhr.getResponseHeader? 'Content-Type'


module.exports = Response

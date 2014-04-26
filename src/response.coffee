
class Response
  constructor: (req) ->
    xhr = req.xhr
    @request = req
    @xhr = xhr
    @status = xhr.status or 0
    @text = xhr.responseText
    @body = xhr.response or xhr.responseText
    @contentType = xhr.contentType or xhr.getResponseHeader? 'Content-Type'
    @headers = do ->
      headers = {}
      if lines = xhr.getAllResponseHeaders?().split '\n'
        for header in lines
          if m = header.match /\s+([^\s]+):\s+([^\s]+)/
            headers[m[1]] = m[2]
      headers
    @isHttpError = @status >= 400


module.exports = Response

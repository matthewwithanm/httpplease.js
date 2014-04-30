module.exports =
  processRequest: (req) ->
    contentType = req.header 'Content-Type'
    if not contentType?
      req.header 'Content-Type', 'application/json'
    else if contentType isnt 'application/json'
      return
    req.body = JSON.stringify req.body
    return

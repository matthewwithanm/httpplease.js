module.exports =
  # Old versions of IE will fail on UTF8 paths, we try to intelligently escape
  # the URL (being careful not to double escape anything).
  processRequest: (req) ->
    req.url = req.url.replace /[^%]+/g, (s) -> encodeURI s

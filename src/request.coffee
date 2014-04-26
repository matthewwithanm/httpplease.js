
class Request
  constructor: (optsOrUrl) ->
    opts =
      if typeof optsOrUrl is 'string' then url: optsOrUrl
      else optsOrUrl

    @method = opts.method?.toUpperCase() or 'GET'
    @url = opts.url
    @headers = opts.headers or {}
    @body = opts.body


module.exports = Request

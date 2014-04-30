
class Request
  constructor: (optsOrUrl) ->
    opts =
      if typeof optsOrUrl is 'string' then url: optsOrUrl
      else optsOrUrl

    @method = opts.method?.toUpperCase() or 'GET'
    @url = opts.url
    @headers = opts.headers or {}
    @body = opts.body
    @errorOn404 = opts.errorOn404 ? true

  header: (name, value) ->
    for own k, v of @headers
      if name.toLowerCase() is k.toLowerCase()
        if arguments.length is 1
          return v
        else
          delete @headers[k]
          break
    if value? then @headers[name] = value


module.exports = Request

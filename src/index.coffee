createXHR = require './createXHR'
delay = require './delay'
{createError} = require './errors'
Response = require './Response'
Request = require './Request'
once = require 'once'


factory = ->
  request = (req, cb) ->
    req = new Request req
    xhr = createXHR req.url

    # Because XHR can be an XMLHttpRequest or an XDomainRequest, we add
    # `onreadystatechange`, `onload`, and `onerror` callbacks. We use the
    # `once` util to make sure that only one is called (and it's only called
    # one time).
    done = once delay (err) ->
      xhr.onload = xhr.onerror = xhr.onreadystatechange = xhr.ontimeout = xhr.onprogress = null
      unless err
        res = new Response req
        for plugin in request.plugins
          plugin?.processResponse res
      cb err, res

    # When the request completes, continue.
    xhr.onreadystatechange = ->
      if xhr.readyState is 4
        switch xhr.status.toString()[...1]
          when '2' then done()
          when '4' then done createError 'Client Error', xhr
          when '5' then done createError 'Server Error', xhr
          else done createError 'HTTP Error', xhr

    # `onload` is only called on success and, in IE, will be called without
    # `xhr.status` having been set, so we don't check it.
    xhr.onload = -> done()
    xhr.onerror = -> done createError 'Internal XHR Error', xhr

    # IE sometimes fails if you don't specify every handler.
    # See http://social.msdn.microsoft.com/Forums/ie/en-US/30ef3add-767c-4436-b8a9-f1ca19b4812e/ie9-rtm-xdomainrequest-issued-requests-may-abort-if-all-event-handlers-not-specified?forum=iewebdevelopment
    xhr.ontimeout = ->
    xhr.onprogress = ->

    req.xhr = xhr

    for plugin in request.plugins
      plugin?.processRequest req

    # Send the request. Since old versions of IE will fail on UTF8 paths, we
    # try to intelligently escape the URL (being careful not to double escape
    # anything).
    xhr.open req.method, req.url.replace /[^%]+/g, (s) -> encodeURI s

    for own k, v of req.headers
      xhr.setRequestHeader k, v

    xhr.send()

  for method in ['get', 'post', 'put', 'head', 'patch', 'delete']
    do (request, method) ->
      request[method] = (req, cb) ->
        req = new Request req
        req.method = method
        request req, cb

  request.plugins = []

  request.use = (plugins...) ->
    newRequest = factory()
    newRequest.plugins = @plugins.concat plugins
    newRequest

  request

module.exports = factory()

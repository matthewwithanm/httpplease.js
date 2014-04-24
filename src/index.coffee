createXHR = require './createXHR'
once = require 'once'
delay = require './delay'
extend = require 'xtend'


parseOpts = (optsOrUrl) ->
  opts =
    if typeof optsOrUrl is 'string' then url: optsOrUrl
    else optsOrUrl
  defaults =
    method: 'GET'
  opts = extend defaults, opts
  opts.method = opts.method.toUpperCase()
  opts.url = opts.url
  opts


class HttpError extends Error
  name: 'HttpError'
  constructor: (@message) ->


httpError = (message, xhr) ->
  err = new HttpError message
  err.status = xhr.status or 0
  err.request = xhr
  err


class Response
  constructor: (xhr) ->
    @request = xhr
    @status = xhr.status or 0
    @text = xhr.responseText

request = (optsOrUrl, cb) ->
  opts = parseOpts optsOrUrl
  xhr = createXHR opts.url

  # Because XHR can be an XMLHttpRequest or an XDomainRequest, we add
  # `onreadystatechange`, `onload`, and `onerror` callbacks. We use the
  # `once` util to make sure that only one is called (and it's only called
  # one time).
  done = once delay (err) ->
    xhr.onload = xhr.onerror = xhr.onreadystatechange = xhr.ontimeout = xhr.onprogress = null
    cb err, if err then null else new Response xhr

  # When the request completes, continue.
  xhr.onreadystatechange = ->
    if xhr.readyState is 4
      switch xhr.status.toString()[...1]
        when '2' then done()
        when '4' then done httpError 'Client Error', xhr
        when '5' then done httpError 'Server Error', xhr
        else done httpError 'HTTP Error', xhr

  # `onload` is only called on success and, in IE, will be called without
  # `xhr.status` having been set, so we don't check it.
  xhr.onload = -> done()
  xhr.onerror = -> done httpError 'Internal XHR Error', xhr

  # IE sometimes fails if you don't specify every handler.
  # See http://social.msdn.microsoft.com/Forums/ie/en-US/30ef3add-767c-4436-b8a9-f1ca19b4812e/ie9-rtm-xdomainrequest-issued-requests-may-abort-if-all-event-handlers-not-specified?forum=iewebdevelopment
  xhr.ontimeout = ->
  xhr.onprogress = ->

  # Send the request. Since old versions of IE will fail on UTF8 paths, we
  # try to intelligently escape the URL (being careful not to double escape
  # anything).
  xhr.open method, url.replace /[^%]+/g, (s) -> encodeURI s
  xhr.send()


for method in ['get', 'post', 'put', 'head', 'patch', 'delete']
  do (method) ->
    request[method] = (optsOrUrl, cb) ->
      opts = extend parseOpts(optsOrUrl), {method}
      request opts, cb


module.exports = request

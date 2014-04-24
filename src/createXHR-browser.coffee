urllite = require 'urllite/lib/core'

# Get the XHR class to use. This is necessary to support IE9, which only
# supports CORS via its proprietary `XDomainRequest` object. But that's not all!
# `XDomainRequest` *doesn't* work for same domain requests, unless your server
# sends CORS headers. So we have to choose which to use based on whether the
# thing we're trying to load is on the same domain.

createXHR = (src) ->
  return null unless window?
  if XHR = window.XMLHttpRequest
    xhr = new XHR
    return xhr if 'withCredentials' of xhr
  if XDR = window.XDomainRequest
    a = urllite src
    b = urllite window.location.href
    return xhr if not a.host
    return xhr if a.protocol is b.protocol and a.host is b.host and a.port is b.port
    return new XDR
  return xhr


module.exports = createXHR

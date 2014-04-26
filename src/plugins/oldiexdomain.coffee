urllite = require 'urllite/lib/core'
once = require 'once'


supportsXHR = once ->
  window?.XMLHttpRequest and 'withCredentials' of new window.XMLHttpRequest

# This plugin creates a Microsoft `XDomainRequest` in supporting browsers when
# the URL being requested is on a different domain. This is necessary to support
# IE9, which only supports CORS via its proprietary `XDomainRequest` object. We
# need to check the URL because `XDomainRequest` *doesn't* work for same domain
# requests (unless your server sends CORS headers). `XDomainRequest` also has
# other limitations (no custom headers), so we try to catch those and error.
module.exports =
  createXHR: (req) ->
    return unless window?

    a = urllite req.url
    b = urllite window.location.href

    # Don't do anything for same-domain requests.
    return if not a.host
    return if a.protocol is b.protocol and a.host is b.host and a.port is b.port

    # Error if there are custom headers. We do this even in browsers that won't
    # use XDomainRequest so that users know there's an issue right away, instead
    # of if/when they test in IE9.
    if req.headers
      for own k, v of req.headers
        throw new Error "You can't provide request headers when using the oldiexdomain plugin."

    # Don't do anything if we can't do anything (:
    return unless window.XDomainRequest

    # Don't do anything if the browser supports proper XHR.
    return if supportsXHR()

    # We've come this far. Might as well make an XDomainRequest.
    new window.XDomainRequest

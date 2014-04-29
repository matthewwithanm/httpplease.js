module.exports =
  processResponse: (res) ->
    # Check to see if the contentype is "something/json" or
    # "something/somethingelse+json"
    if res.contentType and (/^.*\/(?:.*\+)?json(;|\z)/i).test res.contentType
      # If the body hasn't been parsed yet, parse it.
      raw = if typeof res.body is 'string' then res.body else res.text
      res.body = JSON.parse raw if raw

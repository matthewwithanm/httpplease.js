express = require 'express'
cors = require 'cors'

app = express()

app.get '/getjson', cors(), (req, res) ->
  res.json hello: 'world'

# Echo the headers back.
app.all '/headers', cors(), (req, res) ->
  res.json req.headers


module.exports = app

express = require 'express'
cors = require 'cors'

app = express()

app.get '/getjson', cors(), (req, res) ->
  res.json hello: 'world'

# Echo the headers back.
app.all '/headers', cors(), (req, res) ->
  res.json req.headers

app.all '/404', cors(), (req, res) ->
  res.json 404, sad: 'panda'


module.exports = app

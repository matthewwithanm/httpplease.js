express = require 'express'
cors = require 'cors'

app = express()

app.get '/getjson', cors(), (req, res) ->
  res.json hello: 'world'

module.exports = app

assert = chai.assert
http = httpplease
plugins = httppleaseplugins

testServerUrl = 'http://localhost:4001'

describe 'httpplease', ->
  it 'performs a get request', (done) ->
    http.get "#{ testServerUrl }/getjson", (err, res) ->
      assert.equal res.text, JSON.stringify(hello: 'world')
      done()

  it 'identifies errors', (done) ->
    http.get "#{ testServerUrl }/404", (err, res) ->
      assert.equal err.status, 404
      assert err.isHttpError
      done()

  it 'obeys the errorOn404 option', (done) ->
    http.get
      url: "#{ testServerUrl }/404"
      errorOn404: false
      (err, res) ->
        assert.isUndefined err
        assert res.isHttpError
        done()

  it 'sends headers', (done) ->
    req =
      url: "#{ testServerUrl }/headers"
      headers:
        hello: 'world'
    http.get req, (err, res) ->
      json = JSON.parse res.text
      assert.equal json.hello, 'world'
      done()

  describe 'defaults', ->
    it 'adds defaults', ->
      assert.equal http.defaults(dummy: 5).defaults().dummy, 5

    it "doesn't mutate the http function", ->
      http.defaults dummy: 5
      assert.isUndefined http.defaults().dummy

  describe 'use', ->
    it 'adds a plugin', ->
      startCount = http.plugins().length
      assert.equal http.use({}).plugins().length, startCount + 1

    it "doesn't mutate the http function", ->
      startCount = http.plugins().length
      http.use {}
      assert.equal http.plugins().length, startCount

  describe 'bare', ->
    it 'creates a http function without plugins', ->
      assert.equal http.use({}).bare().plugins().length, 0

describe 'plugins', ->
  it 'is used for error responses', (done) ->
    http
      .use plugins.jsonparser
      .get "#{ testServerUrl }/404", (err, res) ->
        assert.deepEqual err.body, sad: 'panda'
        done()

  describe 'jsonparser', ->
    it 'parses json responses', (done) ->
      http
        .use plugins.jsonparser
        .get "#{ testServerUrl }/getjson", (err, res) ->
          assert.deepEqual res.body, hello: 'world'
          done()

    parseWithContentType = (ct, isJsonType = true) ->
      res =
        contentType: ct
        body: '{"hello": "world"}'
      plugins.jsonparser.processResponse res
      if isJsonType then assert.deepEqual res.body, hello: 'world'
      else assert.equal res.body, '{"hello": "world"}'

    it 'honors the content type', ->
      parseWithContentType 'application/json'
      parseWithContentType 'text/json'
      parseWithContentType 'text/json'
      parseWithContentType 'text/something+json'
      parseWithContentType 'application/json; charset=utf-8'
      parseWithContentType 'application/jsonp', false

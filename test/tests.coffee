assert = chai.assert
request = httpplease
plugins = httppleaseplugins

testServerUrl = 'http://localhost:4001'

describe 'httpplease', ->
  it 'performs a get request', (done) ->
    request.get "#{ testServerUrl }/getjson", (err, res) ->
      assert.equal res.text, JSON.stringify(hello: 'world')
      done()

  it 'identifies errors', (done) ->
    request.get "#{ testServerUrl }/404", (err, res) ->
      assert.equal err.status, 404
      assert err.isHttpError
      done()

  it 'obeys the errorOn404 option', (done) ->
    request.get
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
    request.get req, (err, res) ->
      json = JSON.parse res.text
      assert.equal json.hello, 'world'
      done()

  describe 'defaults', ->
    it 'adds defaults', ->
      assert.equal request.defaults(dummy: 5).defaults().dummy, 5

    it "doesn't mutate the request function", ->
      request.defaults dummy: 5
      assert.isUndefined request.defaults().dummy

  describe 'use', ->
    it 'adds a plugin', ->
      startCount = request.plugins().length
      assert.equal request.use({}).plugins().length, startCount + 1

    it "doesn't mutate the request function", ->
      startCount = request.plugins().length
      request.use {}
      assert.equal request.plugins().length, startCount

  describe 'bare', ->
    it 'creates a request function without plugins', ->
      assert.equal request.use({}).bare().plugins().length, 0

describe 'plugins', ->
  it 'is used for error responses', (done) ->
    request
      .use plugins.jsonparser
      .get "#{ testServerUrl }/404", (err, res) ->
        assert.deepEqual err.body, sad: 'panda'
        done()

  describe 'jsonparser', ->
    it 'parses json responses', (done) ->
      request
        .use plugins.jsonparser
        .get "#{ testServerUrl }/getjson", (err, res) ->
          assert.deepEqual res.body, hello: 'world'
          done()

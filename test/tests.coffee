assert = chai.assert
request = httprequest

describe 'httprequest', ->
  it 'performs a get request', (done) ->
    request.get 'http://localhost:4001/getjson', (err, res) ->
      assert.equal res.text, JSON.stringify(hello: 'world')
      done()

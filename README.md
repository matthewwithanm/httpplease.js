httprequest.js
==============

httprequest is a wrapper around XMLHttpRequest with the following major
features:

* Works in the browser and nodejs (thanks to [node-XMLHttpRequest])
* Supports cross-domain requests in older versions of IE9 transparently

[browserify] users can simply `npm install httprequest`.


## API

```javascript
httprequest.get('http://example.com', function(err, res) {
    // Do something with the result.
});
```

Alternatively, you can specify an options object as the first parameter:

```javascript
httprequest.get({url: 'http://example.com'}, function(err, res) {
    // Do something with the result.
});
```

If you'd rather pass the request method as a parameter, that's okay too:

```javascript
httprequest({method: 'GET', url: 'http://example.com'}, function(err, res) {
    // Do something with the result.
});
```


[browserify]: http://browserify.org
[node-XMLHttpRequest]: https://github.com/driverdan/node-XMLHttpRequest

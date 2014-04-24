httprequest.js
==============

httprequest is a wrapper around XMLHttpRequest with the following major
features:

* Works in the browser and nodejs (thanks to [node-XMLHttpRequest])
* Supports cross-domain requests in older versions of IE9 transparently

[browserify] users can simply `npm install httprequest`.

Minified and gzipped, the standalone browser build is ~2K.


## API


### Making a request

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


### Supported options

The following options are supported:

<table>
    <tr>
        <th>Name</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>url</code></td>
        <td>The URL to request.</td>
    </tr>
    <tr>
        <td><code>method</code></td>
        <td>The HTTP method to use for the request.</td>
    </tr>
</table>


### The result object

The result object passed to your callback in the event of a successful request
has the following properties:

<table>
    <tr>
        <td><code>status</code></td>
        <td>The numeric status code.</td>
    </tr>
    <tr>
        <td><code>text</code></td>
        <td>The response text.</td>
    </tr>
    <tr>
        <td><code>request</code></td>
        <td>The XHR or XDomain object used to make the request.</td>
    </tr>
</table>


### The error object

In the event of an error, an error object will be passed as the first argument
to your callback. It has the following properties:

<table>
    <tr>
        <td><code>status</code></td>
        <td>The numeric status code.</td>
    </tr>
    <tr>
        <td><code>message</code></td>
        <td>A description of the error.</td>
    </tr>
    <tr>
        <td><code>request</code></td>
        <td>The XHR or XDomain object used to make the request.</td>
    </tr>
</table>


## Similar Projects

* [xhr] \(browser only\)
* [httpify] \(wraps xhr and [request]\)


[browserify]: http://browserify.org
[node-XMLHttpRequest]: https://github.com/driverdan/node-XMLHttpRequest
[xhr]: https://github.com/Raynos/xhr
[httpify]: https://github.com/scottcorgan/httpify
[request]: https://github.com/mikeal/request

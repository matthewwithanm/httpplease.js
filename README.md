httprequest.js
==============

httprequest is a wrapper around XMLHttpRequest with the following awesome
features:

* Works in the browser and nodejs (thanks to [node-XMLHttpRequest])
* Extensible via a simple but powerful plugin system
* Supports cross-domain requests in older versions of IE9 transparently with the
  [oldiexdomain plugin](#plugins)

[browserify] users can simply `npm install httprequest`.

Minified and gzipped, the standalone browser build is ~2K.


## API


### Making a request

```javascript
httprequest.get('http://example.com', function(err, res) {
    // Do something with the result.
});
```

Alternatively, you can pass a request object as the first parameter:

```javascript
httprequest.get({url: 'http://example.com'}, function(err, res) {
    // Do something with the result.
});
```

If you'd rather include the method in the object, that's okay too:

```javascript
httprequest({method: 'GET', url: 'http://example.com'}, function(err, res) {
    // Do something with the result.
});
```


### The request object

The request object supports the following properties:

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
    <tr>
        <td><code>headers</code></td>
        <td>
            An object containing HTTP headers to send, for example:
            <code>{Accept: '*/*'}</code>.
        </td>
    </tr>
</table>


### The response object

The response object passed to your callback in the event of a successful request
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
        <td>An object representing the request.</td>
    </tr>
    <tr>
        <td><code>xhr</code></td>
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
        <td>An object representing the request.</td>
    </tr>
    <tr>
        <td><code>xhr</code></td>
        <td>The XHR or XDomain object used to make the request.</td>
    </tr>
</table>


### Plugins

httprequest supports plugins for changing how requests are made. Some plugins
are built in:

<table>
    <tr>
        <th>Name</th>
        <th>Enabled by Default?</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>cleanurl</td>
        <td>Yes</td>
        <td>
            Encodes unencoded characters in the request URL. Required by some
            browsers if you're using non-ASCII characters.
        </td>
    </tr>
    <tr>
        <td>oldiexdomain</td>
        <td>No</td>
        <td>
            Enables cross domain requests in IE9 by (transparently) using the
            <code>XDomainRequest</code> object when necessary.
        </td>
    </tr>
</table>

Plugins are enabled with the `use` method:

```javascript
var oldiexdomain = require('httprequest/lib/plugins/oldiexdomain');
httprequest = httprequest.use(oldiexdomain);
```

Or, if you're using the standalone build:

```html
<script src="httprequest.js" type="text/javascript"></script>
<script src="httprequestplugins.js" type="text/javascript"></script>
```

```javascript
var oldiexdomain = httprequestplugins.oldiexdomain;
httprequest = httprequest.use(oldiexdomain);
```

Notice that `use` returns a new httprequest instance. This is so that you can
create multiple instances, each with their own plugins:

```javascript
var request = httprequest.use(oldiexdomain);
var request2 = httprequest;

request.get('http://example.com', function(err, res) { ... }); // "oldiexdomain" plugin is used.
request2.get('http://example.com', function(err, res) { ... }); // No plugins are used.
```

You can use as many plugins as you want—either by passing multiple plugins to
`use` or chaining calls:

```javascript
var request = httprequest
  .use(oldiexdomain, myPlugin, myOtherPlugin)
  .use(anotherPlugin);
```

In order to keep your builds as small as possible, **most plugins aren't enabled
by default**. (See the table above.) However, some small plugins are. If you
want to disable all plugins, use the `bare()` method:

```javascript
var request = httprequest.bare();
```

Like `use()`, this method also returns a new httprequest instance so you can
continue to use the old object with the original plugins intact.


#### Custom Plugins

In addition to the bundled plugins, you can create your own. Plugins are simply
objects that implement one or more of the following methods:

<table>
    <tr>
        <th>Method</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>createXHR(req)</code></td>
        <td>
            Creates an XHR object. The first plugin that return a non-null value
            from this method will be used.
        </td>
    </tr>
    <tr>
        <td><code>processRequest(req)</code></td>
        <td>
            This method gives the plugin a chance to manipulate the request
            object before the request is made. For example, it can change the
            body or add headers.
        </td>
    </tr>
    <tr>
        <td><code>processResponse(res)</code></td>
        <td>
            This method gives the plugin a chance to manipulate the response
            object before the callback is invoked.
        </td>
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

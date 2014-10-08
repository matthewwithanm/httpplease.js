HTTP, Please
============

There are a lot of JS libraries for making HTTP requests in JavaScript. Why use
this one? Because it's awesome, that's why. And this is why it's awesome:

* Designed for **"isomorphic" JavaScript** (supporting both client and server
  with the same codebase)
* …but with a **browser-driven focus** that keeps in mind the limitations of
  that environment (filesize, old IE)
* Extensible via a **simple but powerful plugin system** (which it dogfoods)
    * Supports **cross-domain requests in IE9** transparently with the
      [oldiexdomain plugin](#plugins)
    * Supports promises (thenable/catchable request objects) with the
      [promises plugin]

[browserify] and [webpack] users can simply `npm install httpplease`.

[Bower] users can `bower install httpplease`.

`<script>` tag fans can grab the standalone build from the "browser-builds"
directory.

Minified and gzipped, the standalone browser build is <2K.


## API


### Making a request

```javascript
httpplease.get('http://example.com', function (err, res) {
    // Do something with the result.
});
```

Alternatively, you can pass a request options object as the first parameter:

```javascript
httpplease.get({url: 'http://example.com'}, function (err, res) {
    // Do something with the result.
});
```

If you'd rather include the method in the object, that's okay too:

```javascript
httpplease({method: 'GET', url: 'http://example.com'}, function (err, res) {
    // Do something with the result.
});
```

You can create a new http function with default request object values:

```javascript
var http = httpplease.defaults({method: 'GET', errorOn404: false});
http('http://example.com', function (err, res) {
    // This request was made using the defaults specified above.
});
```


### The request object

When you call one of the http functions (`http`, `http.get`, etc.), the result
is a Request object. This object can also be processed by [plugins](#plugins).
It has the same properties as the request options object you pass to the http
function (though properties that you didn't pass will be filled by defaults).
Those properties are:

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
        <td><code>body</code></td>
        <td>The body to send with the request.</td>
    </tr>
    <tr>
        <td><code>headers</code></td>
        <td>
            An object containing HTTP headers to send, for example:
            <code>{Accept: '*/*'}</code>.
        </td>
    </tr>
    <tr>
        <td><code>errorOn404</code></td>
        <td>
          A boolean specifying whether a 404 response should be treated as an
          error or not. Defaults to <code>true</code>.
        </td>
    </tr>
    <tr>
        <td><code>aborted</code></td>
        <td>
          Was this request aborted by calling the <code>abort()</code> method?
        </td>
    </tr>
    <tr>
        <td><code>header</code></td>
        <td>
            A method for getting and setting individual headers. This is simply
            a convenience method for reading and manipulating the
            <code>headers</code> dictionary that accounts for the
            case-insensitivity of headers. For example:
            <code>req.header('Content-Type', 'text/html')</code> sets a header
            and <code>req.header('Content-Type')</code> returns its value.
        </td>
    </tr>
    <tr>
        <td><code>abort</code></td>
        <td>
            A method for aborting the request. This will will result in your
            callback being invoked. If an error was caused by an
            <code>abort()</code> call, its name will be <code>"Abort"</code>.
            (Also, <code>err.request.aborted</code> will be <code>true</code>.)
        </td>
    </tr>
</table>


### The error object

In the event of an error, an error object will be passed as the first argument
to your callback. If the error is an HTTP error, it will have all of the
properties that a response object has (listed below), but will be a JS Error
object (which can be useful if relying on instanceof checks). It also has one
additional property—`message`—which contains a description of the error.


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
        <td>The raw response text.</td>
    </tr>
    <tr>
        <td><code>body</code></td>
        <td>
            The processed response body. Depending on the content type of the
            response and the plugins being used, this may be the same as
            `response.text` (a string) or some other object (like a parsed JSON
            object).
        </td>
    </tr>
    <tr>
        <td><code>contentType</code></td>
        <td>The content type of the response.</td>
    </tr>
    <tr>
        <td><code>headers</code></td>
        <td>An object containing the parsed response headers.</td>
    </tr>
    <tr>
        <td><code>header</code></td>
        <td>
            A method for looking up the value of a specific header. This takes
            into account the case-insensitivity of headers. For example,
            <code>res.header('content-type')</code> will return the correct
            value regardless of the actual capitalization.
        </td>
    </tr>
    <tr>
        <td><code>isHttpError</code></td>
        <td>
          A boolean that specifies whether this object represents a
          server-reported HTTP error. This may be false—even on error objects—in
          the case of non-HTTP errors like XDomain failures or plugin errors.
        </td>
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

httpplease supports plugins for changing how requests are made. Some plugins
are built in:

<table>
    <tr>
        <th>Name</th>
        <th>Enabled by Default?</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>jsonparser</td>
        <td>No</td>
        <td>
            Converts JSON responses into JS objects on
            <code>response.body</code>.
        </td>
    </tr>
    <tr>
        <td>jsonrequest</td>
        <td>No</td>
        <td>
            Serializes regular JavaScript objects stored on
            <code>request.body</code> and sets the Content-Type header to
            "application/json".
        </td>
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
    <tr>
        <td>oldieactivex</td>
        <td>No</td>
        <td>
            For
            <a href="http://en.wikipedia.org/wiki/XMLHttpRequest#Support_in_Internet_Explorer_versions_5.2C_5.5.2C_and_6">super old versions of IE</a>
            that didn't define XMLHttpRequest, use an ActiveX object.
        </td>
    </tr>
    <tr>
        <td>setprotocol</td>
        <td>No</td>
        <td>
            Automatically set the protocol for protocol-relative URLs, allowing
            them to be used in Node. Protocol-relative URLs are important and
            should be preferred since some browsers don't allow cross-protocol
            requests. This plugin can also optionally force an override of
            protocols even when they're present in the URL so that you can be
            sure you won't have cross-protocol request issues in browsers.
        </td>
    </tr>
</table>

Plugins are enabled with the `use` method:

```javascript
var jsonparser = require('httpplease/lib/plugins/jsonparser');
httpplease = httpplease.use(jsonparser);
```

Or, if you're using the standalone build:

```html
<script src="httpplease.js" type="text/javascript"></script>
<script src="httppleaseplugins.js" type="text/javascript"></script>
```

```javascript
var jsonparser = httppleaseplugins.jsonparser;
httpplease = httpplease.use(jsonparser);
```

Notice that `use` returns a new httpplease instance. This is so that you can
create multiple instances, each with their own plugins:

```javascript
var http = httpplease.use(jsonparser);

http
  .use(oldiexdomain)
  .get('http://example.com', function (err, res) { ... }); // Uses "jsonparser" plugin and "oldiexdomain".
http.get('http://example.com', function (err, res) { ... }); // Only uses "jsonparser" plugin.
httpplease.get('http://example.com', function (err, res) { ... }); // No extra plugins are used.
```

You can use as many plugins as you want—either by passing multiple plugins to
`use` or chaining calls:

```javascript
var http = httpplease
  .use(jsonparser, oldiexdomain, myPlugin)
  .use(anotherPlugin);
```

In order to keep your builds as small as possible, **most plugins aren't enabled
by default**. (See the table above.) However, some small plugins are. If you
want to disable all plugins, use the `bare()` method:

```javascript
var http = httpplease.bare();
```

Like `use()`, this method also returns a new httpplease instance so you can
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
* [request] \(node only\)
* [httpify] \(wraps xhr and [request]\)


## Thanks

This project is mostly just a small wrapper around XMLHttpRequest and an (I
hope) sensible structure for extending functionality. The reason it works on the
server is because of [driverdan]'s awesome [node-XMLHttpRequest] library—it's
the secret sauce that makes the browser-focused design of httpplease possible!


[promises plugin]: https://github.com/matthewwithanm/httpplease-promises
[browserify]: http://browserify.org
[webpack]: http://webpack.github.io
[Bower]: http://bower.io
[driverdan]: https://github.com/driverdan
[node-XMLHttpRequest]: https://github.com/driverdan/node-XMLHttpRequest
[xhr]: https://github.com/Raynos/xhr
[httpify]: https://github.com/scottcorgan/httpify
[request]: https://github.com/mikeal/request

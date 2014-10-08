/*jshint strict:false */

var app,
    express = require('express'),
    cors = require('cors');

app = express();

app.get('/getjson', cors(), function (req, res) {
    res.json({hello: 'world'});
});

app.get('/slow', cors(), function (req, res) {
    setTimeout(function () {
        res.json({hello: 'world'});
    }, 1000);
});

// Echo the headers back.
app.all('/headers', cors(), function (req, res) {
    res.json(req.headers);
});

app.all('/404', cors(), function (req, res) {
    res.json(404, {sad: 'panda'});
});


module.exports = app;

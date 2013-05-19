#!/usr/bin/env node

'use strict';

var config = require('./config.json')
var fs = require('fs');
var http = require('http');
var childProcess = require('child_process');
var path = require('path');
var url = require('url');
var querystring = require('querystring');
var gm = require('gm');


var phantomserver = childProcess.spawn(config.phantomjs, ['--ignore-ssl-errors=true', './phantomserver.js'], {cwd: '.'});
phantomserver.stdout.on('data', function (data) {
  console.log('phantomserver stdout: ' + data);
});
phantomserver.stderr.on('data', function (data) {
  console.log('phantomserver stderr: ' + data);
});
phantomserver.on('close', function (code) {
  console.log('phantomserver closed with code: ' + code);
});
phantomserver.on('error', function(err) {
  console.log('phantomserver error: ' + err);
})

var server = http.createServer();
server.on('request', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS', 'GET');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
  }
  else if (req.method === 'GET') {
    var parsedURL = url.parse(req.url);
    var query = parsedURL.query;
    var parsedQuery = querystring.parse(query);
    var encodedURL = parsedQuery.URL;
    // var URL = decodeURIComponent(encodedURL);
    getPreview(encodedURL, function(err, result) {
      if (err)
        return ERROR(err);

      res.writeHead(200);
      res.end(JSON.stringify(result));
    })
  }
});
server.listen(config.listen.port, config.hostname);

var getPreview = function(URL, callback) {
  var options = {
    hostname: 'localhost',
    port: config['phantomserver-port'],
    method: 'GET',
    path: '/' + URL,
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      var result = JSON.parse(chunk);
      var miniatureName = path.basename(result.miniature);
      var newMiniaturePath = path.join(config['miniatures-folder'], miniatureName);
      gm(result.miniature)
        .resize(200, 200)
        .write(newMiniaturePath, function(err) {
          fs.unlink(result.miniature, function (err) {
            if (err)
              return ERROR(err);
          });
          if (err)
            return ERROR(err);

          var preview = {
            thumbnail: config.urlPrefix + path.join('miniatures', miniatureName),
            title: result.title,
            favicon: 'http://g.etfv.co/' + URL
          };
          callback(null, preview);
        });
    });
  });
  req.on('error', function(e) {
    ERROR(e)
  });
  req.end();
};

global.ERROR = function(err) {
  console.trace(err);
}

global.DEBUG = function(msg) {
  console.log(msg);
}
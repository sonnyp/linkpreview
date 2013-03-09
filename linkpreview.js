#!/usr/bin/env node

'use strict';

var config = require('./config.json')
var fs = require('fs');
var http = require('http');
var childProcess = require('child_process');
var path = require('path');
var gm = require('gm');

var server = http.createServer();
server.on('request', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS', 'POST', 'GET');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
  }
  else if (req.method === 'POST') {
    var chunks = [];
    req.on('data', function(chunk) {
      chunks.push(chunk);
    });
    req.on('end', function() {
      var data = Buffer.concat(chunks);
      try {
        var data = JSON.parse(data.toString());
      }
      catch (e) {
        res.writeHead('400');
        return res.end(JSON.stringify({error: 'Malformed JSON.'}));
      }
      if (!data.url) {
        res.writeHead('400');
        return res.end(JSON.stringify({error: 'Missing URL property.'}));
      }

      getPreview(data.url, function(err, result) {
        if (err)
          return ERROR(err)

        delete result.id;
        res.writeHead(200);
        res.end(JSON.stringify(result));
      })
    })
  }
});
server.listen(config.listen.port, config.hostname);

var getPreview = function(url, callback) {
  var options = {
    hostname: 'localhost',
    port: 9999,
    path: '/?url=' + url,
    method: 'GET',
  };

  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      var result = JSON.parse(chunk);
      gm(path.join(config.tmp, result.miniature))
        .resize(200, 200)
        .write(path.join(config.miniatures, result.miniature), function(err) {
          fs.unlink(path.join(config.tmp, result.miniature), function (err) {
            if (err)
              return ERROR(err);
          });
          if (err)
            return ERROR(err);

          var preview = {
            thumbnail: 'http://linkpreview/miniatures/' + result.miniature,
            title: result.title
          }
          callback(null, preview)
        });
    });
  });

  req.on('error', function(e) {
    ERROR(e)
  });

  var payload = {
    url: url
  };
  // write data to request body
  // req.write();
  req.end();
};

global.ERROR = function(err) {
  console.trace(err);
}

global.DEBUG = function(msg) {
  console.log(msg);
}
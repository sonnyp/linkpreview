'use strict';

var webpage = require('webpage');
var fs = require('fs');
var config = JSON.parse(fs.read('config.json'));
var server = require('webserver').create();

var service = server.listen('127.0.0.1:' + config['phantomserver-port'], function(req, res) {
  var url = decodeURIComponent(req.url.substr(1));
  get(url, function(result) {
    res.statusCode = 200;
    res.write(JSON.stringify(result));
    res.close();
  });
});


var get = function(aURL, callback) {
  var page = webpage.create();
  page.viewportSize = { width: 1024, height: 1024};
  page.open(aURL, function (status) {
    var title = page.title;
    var id = Math.random();
    var name = id + '.png';
    var pathname = config.tmp + name;
    page.clipRect = {top: 0, left: 0, width: 1024, height: 1024};
    page.render(pathname);
    page.close();
    callback({title: title, url: aURL, miniature: pathname});
  });
};
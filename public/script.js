'use strict';

(function() {

var config = linkpreview.config;
var titleEl;
var miniatureEl;
var faviconEl;

document.addEventListener('DOMContentLoaded', function() {
  titleEl = document.getElementById('title');
  miniatureEl = document.getElementById('miniature');
  faviconEl = document.getElementById('favicon');

  var form = document.querySelector('form');
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var url = this.elements['url'].value;

    var req = new XMLHttpRequest();
    req.open('GET', config.server + '/' + url, true);
    req.addEventListener('readystatechange', function() {
      if (req.readyState !== 4)
        return;
      
      if (req.status === 200)
        handleResponse(JSON.parse(req.responseText));
      else
        console.log(req.status)
    });
    req.send(null);
  });
});

var handleResponse = function(response) {
  miniatureEl.src = response.thumbnail;
  titleEl.textContent = response.title;
  faviconEl.src = response.favicon;
};

})();

'use strict';

(function() {

var config = linkpreview.config;
var titleEl;
var miniatureEl;

document.addEventListener('DOMContentLoaded', function() {
  titleEl = document.getElementById('title')
  miniatureEl = document.getElementById('miniature');

  var form = document.querySelector('form');
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var url = this.elements['url'].value;
    var payload = {
      url: url
    };

    var req = new XMLHttpRequest();
    req.open('POST', config.server, true);
    req.addEventListener('readystatechange', function() {
      if (req.readyState !== 4)
        return;
      
      if (req.status === 200)
        handleResponse(JSON.parse(req.responseText));
      else
        console.log(req.status)
    });
    req.send(JSON.stringify(payload));
  });
});

var handleResponse = function(response) {
  miniatureEl.src = response.thumbnail;
  titleEl.textContent = response.title;
}

})();

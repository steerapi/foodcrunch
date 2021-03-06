var request = require('request');
var querystring = require('querystring');

var apiBaseUrl = process.env.SINGLY_API_HOST || 'https://api.singly.com';
var API_VERSION = 0;

module.exports = function(clientId, clientSecret, redirectURI) {
  var client = {};

  client.getAuthorizeURL = function(service, options) {
    if (!options) options = {};
    if (!options.client_id) options.client_id = clientId;
    if (!options.redirect_uri) options.redirect_uri = redirectURI;
    options.service = service;
    return apiBaseUrl + '/oauth/authorize?' + querystring.stringify(options);
  };

  client.getAccessToken = function(code, callback) {
    var data = {
       client_id: clientId,
       client_secret: clientSecret,
       code: code
    };

    request.post({
       uri: apiBaseUrl + '/oauth/access_token',
       body: querystring.stringify(data),
       headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
       }
    }, function (err, resp, body) {
      if(err) return callback(err, resp, body);
      try {
        body = JSON.parse(body);
        callback(undefined, resp, body);
      } catch(parseErr) {
        callback(err, resp, body);
      }
    });
  };

  // build a consistent and clean URI
  function getURI(path) {
    var uri = apiBaseUrl;
    if (path.indexOf(/\/?v[0-9]/) !== 0) uri += '/v' + API_VERSION;
    if (path.indexOf('/') !== 0) uri += '/';
    return uri + path;
  }

  function setupAPICall(options) {
    if (options.access_token && !(options.qs && options.qs.access_token)) {
      if (!options.qs) options.qs = {};
      options.qs.access_token = options.access_token;
    }
  }

  client.post = function(path, options, callback) {
    var uri = getURI(path);
    setupAPICall(options);
    request.post({uri:uri, json:options.body, qs:options.qs}, callback);
  };

  client.get = function(path, options, callback) {
    var uri = getURI(path);
    setupAPICall(options);
    request.get({uri:uri, json:true, qs:options.qs}, callback);
  };

  client.apiCall = function(path, params, callback) {
    console.warn('singly.apiCall is deprecated and will be removed in future verions. ' +
                 'Please use singly.get and singly.post.');
    var uri = apiBaseUrl + path + '?' + querystring.stringify(params);
    request.get({uri:uri, json:true}, function(err, resp, json) {
      callback(err, json);
    });
  };

  return client;
};

'use strict';
const newrelic = require('newrelic');

const restify = require('restify');
const controllers = require('./controllers');
const utils = require('./utils');

var server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(utils.defaultHeaders);

// Endpoints
server.get('/status/:transactionId', controllers.status);
server.post('/tokenize',             controllers.tokenize);
server.post('/pay',                  controllers.pay);

server.listen(8000, function() {
  console.log('%s listening at %s', server.name, server.url);
})
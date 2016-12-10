'use strict';

var ftpServer = require('../lib/server.js');
var options = ftpServer.options;
var _server = ftpServer.makeServer();
_server.listen(options.port);

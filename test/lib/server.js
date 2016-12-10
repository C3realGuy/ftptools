'use strict';

var ftpd = require('ftpd');
var Path = require('path');
var fs = require('fs-extra');

/**
 * [users description]
 * @type {Object}
 * permissions:
 *   M => mkdir
 *   R => removedir
 *   U => upload
 *   D => download
 *   L => List
 */
var users = {
    'everything': {
        'pass': 'test123',
        'permissions': '*',
    },
    'nomkdir': {
        'pass': '1337pa$$',
        'permissions': 'LRUD',
    },
    'nolist': {
        'pass': 'test',
        'permissions': 'MRUD',
    },
};

var options = {
    users: users,
    host: process.env.IP || '127.0.0.1',
    port: process.env.PORT || 7003,
    useList: true,
    cwd: '/',
    root: Path.join(__dirname, '../ftphome'),
    tls: null,
};

function makeServer() {
    console.log('Making FTP Server...');
    console.log('Cleaning root...');
    fs.emptyDir(options.root);
    var server = new ftpd.FtpServer(options.host, {
        getInitialCwd: function() {
            return options.cwd;
        },
        getRoot: function() {
            return options.root;
        },
        pasvPortRangeStart: 1025,
        pasvPortRangeEnd: 1050,
        tlsOptions: options.tls,
        allowUnauthorizedTls: false,
        useWriteFile: false,
        useReadFile: false,
        uploadMaxSlurpSize: 7000, // N/A unless 'useWriteFile' is true.
    });

    server.on('error', function(error) {
        console.log('FTP Server error:', error);
    });

    server.on('client:connected', function(connection) {
        var username = null;
        //console.log('client connected: ' + connection.remoteAddress);
        connection.on('command:user', function(user, success, failure) {
            //console.log('USER: ' + user);
            if (users.hasOwnProperty(user)) {
                username = user;
                success();
            } else {
                failure();
            }
        });

        connection.on('command:pass', function(pass, success, failure) {
            //console.log('PASS: ' + pass);
            if (users[username].pass === pass) {
                success(username);
            } else {
                failure();
            }
        });

        connection.on('command:mkd:before', function(mkdirRequest,
                                                     success,
                                                     failure) {
            if (users[username].permissions === '*' ||
                users[username].permissions.includes('M')) {
                success();
            } else {
                failure('No permission');
            }
        });

        connection.on('command:rmd:before', function(rmdirRequest,
                                                     success,
                                                     failure) {
            if (users[username].permissions === '*' ||
                users[username].permissions.includes('R')) {
                success();
            } else {
                failure('No permission');
            }
        });

        connection.on('command:list:before', function(listRequest,
                                                      success,
                                                      failure) {
            if (users[username].permissions === '*' ||
                users[username].permissions.includes('L')) {
                success();
            } else {
                failure('No permission');
            }
        });
    });

    return server;
}

module.exports = {
    makeServer: makeServer,
    options: options,
};

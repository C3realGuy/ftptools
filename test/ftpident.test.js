'use strict';

var assert = require('assert');
var should = require('should');
var ftpIdent = require('../lib/ftpIdent.js');
var ftpServer = require('./lib/server.js');
var options = ftpServer.options;

describe('ftpIdent', function() {
    before(function(done) {
        var _server = ftpServer.makeServer();
        _server.listen(options.port);
        setTimeout(done, 1000);
    });

    it('can login if user and pass are correct', function(done) {
        var ftpId = new ftpIdent({
            host: options.host,
            port: options.port,
            user: 'everything',
            pass: options.users.everything.pass,
            dontRun: true,
        });
        ftpId.canLogin(function(err, loginInfo) {
            should(err).be.undefined();
            loginInfo.canLogin.should.be.true();
            ftpId.result.should.eql({canLogin: true, errors: {}});
            done();
        });
    });

    it('can not login if user and pass are incorrect', function(done) {
        var ftpId = new ftpIdent({
            host: options.host,
            port: options.port,
            user: options.users.everything + 'wrong',
            pass: options.users.everything.pass,
        });
        ftpId.canLogin(function(err, loginInfo) {
            err.message.should.be.eql('530 Not logged in.');
            loginInfo.canLogin.should.be.false();
            ftpId.result.should.eql({canLogin: false, errors:
                 {canLogin: '530 Not logged in.'}});
            done();
        });
    });

    it('can list if i have permission to', function(done) {
        var ftpId = new ftpIdent({
            host: options.host,
            port: options.port,
            user: 'everything',
            pass: options.users.everything.pass,
        });
        ftpId.canList(function(err, listInfo) {
            should(err).be.undefined();
            listInfo.canList.should.be.true();
            done();
        });
    });

    it('can not list if i don\'t have permission to', function(done) {
        var ftpId = new ftpIdent({
            host: options.host,
            port: options.port,
            user: 'nolist',
            pass: options.users.nolist.pass,
        });
        ftpId.canList(function(err, listInfo) {
            err.message.should.be.eql('550 No permission');
            listInfo.canList.should.be.false();
            ftpId.result.should.eql({canList: false, errors:
                 {canList: '550 No permission'}});
            done();
        });
    });

    it('can make a dir', function(done) {
        var ftpId = new ftpIdent({
            host: options.host,
            port: options.port,
            user: 'everything',
            pass: options.users.everything.pass,
        });
        ftpId.canMkdir(function(err, mkdirInfo) {
            should(err).be.undefined();
            ftpId.result.canMkdir.should.be.true();
            done();
        });
    });

    it('can not make a dir without permission', function(done) {
        var ftpId = new ftpIdent({
            host: options.host,
            port: options.port,
            user: 'nomkdir',
            pass: options.users.nomkdir.pass,
        });
        ftpId.canMkdir(function(err, mkdirInfo) {
            err.message.should.be.eql('550 No permission');
            ftpId.result.canMkdir.should.be.false();
            ftpId.result.should.eql({canMkdir: false, errors:
                 {canMkdir: '550 No permission'}});
            done();
        });
    });
});

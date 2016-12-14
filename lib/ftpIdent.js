'use strict';

var JSFtp = require('jsftp');
var extend = require('util')._extend;

var FtpIdent = module.exports = function(options, cb) {
    var self = this;
    this.result = {
        errors: {},
    };

    self.options = options;
    self.options.debugMode = true;

    self._ftp = new JSFtp(options);
    if (cb || options.dontRun == false) {
        self.ident(cb);
    }
};

FtpIdent.prototype.canLogin = function(cb) {
    var self = this;
    var loginInfo = {canLogin: false};
    self._ftp.auth(self.options.user, self.options.pass, function(err) {
        err = _unifiyErr(err);
        if (err) {
            self.result.errors['canLogin'] = err.message;
        } else {
            loginInfo.canLogin = true;
        }
        self.result = extend(self.result, loginInfo);
        cb(err, loginInfo);
    });
};

FtpIdent.prototype.canList = function(cb) {
    var self = this;
    var listInfo = {canList: false};
    self._ftp.ls('/', function(err, res) {
        err = _unifiyErr(err);
        if (err) {
            self.result.errors['canList'] = err.message;
        } else {
            listInfo.canList = true;
        }
        self.result = extend(self.result, listInfo);
        cb(err, listInfo);
    });
};

FtpIdent.prototype.canMkdir = function(cb) {
    var self = this;
    var mkdirInfo = {canMkdir: false};
    var pathMkdir = '/testCanMkdir';
    self._ftp.raw.mkd(pathMkdir, function(err, data) {
        err = _unifiyErr(err);
        if (err) {
            self.result.errors['canMkdir'] = err.message;
        } else {
            self._madeDir = pathMkdir;
            mkdirInfo.canMkdir = true;
        }
        self.result = extend(self.result, mkdirInfo);
        cb(err, mkdirInfo);
    });
};

FtpIdent.prototype.canRmdir = function(cb) {
    var self = this;
    var rmdirInfo = {canRmdir: false};
    var pathRmdir = '/testCanRmdir' || self._madeDir;
    self._ftp.raw.rmd(pathRmdir, function(err, data) {
        err = _unifiyErr(err);
        if (err) {
            self.result.errors['canRmdir'] = err.message;
        } else {
            rmdirInfo.canRmdir = true;
        }
        self.result = extend(self.result, rmdirInfo);
        cb(err, rmdirInfo);
    });
};

FtpIdent.prototype.ident = function(cb) {
    var self = this;
    self.canLogin(function(err, loginInfo) {
        self.canList(function(err, listInfo) {
            cb(self.result);
        });
    });
};

function _unifiyErr(err) {
    if (err === null) {
        return undefined;
    }
    return err;
}

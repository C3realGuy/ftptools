'use strict';
var ListFTPContent;

var JSFtp = require('jsftp');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

/**
 * Iterate over all files and folders accessable by a FTP Server
 * @param  {[type]} ftp [description]
 * @return {[type]}     [description]
 */
ListFTPContent = function(options) {
    this._ftp = new JSFtp(options);
    this.searchFolders = options.searchFolders || ['/'];
};

inherits(ListFTPContent, EventEmitter);

ListFTPContent.prototype.run = function(cb) {
    var self = this;

    return async.eachSeries(self.searchFolders, function(searchFolder, cb1) {
        self.recPath(searchFolder, 0, cb1);
    }, function(err) {
        if (err) {
      // We only try to close the FTP Session, maybe something went wrong before
            self._ftp.raw.quit(function(err, data) {
                cb(err);
            });
        } else {
            self._ftp.raw.quit(function(err, data) {
                if (err) {
                    return cb(err);
                }
                cb(err);
            });
        }
    });
};

ListFTPContent.prototype.recPath = function(path, depth, cb) {
    var self = this;

    self._ftp.ls(path, function(err, list) {
        if (err) return cb(err);

        return async.eachSeries(list, function(listItem, cb1) {
            if (listItem.type == 1) {
        // Folder
                self.emit('folder', listItem.name, path, depth, listItem);
                self.recPath(path + listItem.name + '/', depth + 1, cb1);
            } else if (listItem.type == 0) {
        // File
                self.emit('file', listItem.name, path, depth, listItem);
                cb1();
            } else {
                cb1('Unknown listItem type: ' + listItem.type);
            }
        }, cb);
    });
};

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] :
                ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
}

var lfc = new ListFTPContent({
    host: 'localhost',
    port: 2221, // defaults to 21
    user: 'leech', // defaults to "anonymous"
    pass: 'ddristsowiesobeschde', // defaults to "@anonymous"
});

var size = 0;

lfc.on('file', function(name, path, depth, item) {
    size += parseInt(item.size);
});

lfc.on('folder', function(name, path, depth, item) {
    if (depth == 0) {
        console.log('[b]' + name + '[/b]');
    } else {
        console.log(Array(depth + 1).join(' ') + name);
    }
});

lfc.run(function(err) {
    if (err) console.log(err);
    console.log('Done');
});

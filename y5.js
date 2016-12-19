"use strict";

var net = require('net');
var dolog = true;

var Y5 = function (ip, cb) {
    if (!(this instanceof Y5)) {
        return new Y5(ip, cb);
    }
    if (typeof ip === 'function') {
        cb = ip;
        ip = undefined;
    }
    var self = this;
    var interval, client, oTimeout, oConnected;
    
    this.onData = function (data) {};
    this.onTimeout = function () {};
    
    client = new net.Socket();
    client.on('data', function(data) {
        self.onData(data);
    });
    //client.on('end', function() {});
    client.on('error', function (error) {
        dolog && console.log('error: ' + error.errno + ' ' + error.message);
        switch (error.errno) { //error.code
            case 'ETIMEDOUT':
                if (self.onTimeout() === true)
                    return;
            case 'ECONNRESET':
            case 'EPIPE':
                if (oTimeout) clearTimeout(oTimeout);
                oTimeout = setTimeout(self.reconnect.bind(self), 3000);
                break;
        }
    });
    client.on('close', function() {
        dolog && console.log('Connection closed');
        if (oConnected !== undefined) {
            if (oConnected) clearTimeout(oConnected);
            if (oConnected === null) cb && cb('close');
            oConnected = undefined;
        }
    });
    
    this.close = function (setClient2null) {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        if (client) {
            client.destroy();
            //client.end();
        }
        if (setClient2null !== false) client = null;
    };

    this.connect = function(_ip) {
        ip = _ip || ip;
        if (!client) return cb && cb('!client');
        client.connect(50000, ip, function() {
            dolog && console.log('connected...');
            self.send('@MAIN:PWR=?');
            interval = setInterval(function() {
                self.send('@MAIN:PWR=?');
            }, 30000);
            oConnected = setTimeout(function() {
                dolog && console.log('oConnected = null -> cb()');
                oConnected = null;
                cb && cb();
            }, 2000)
        });
    };
    
    this.send = function (s) {
        client.write(s + '\r\n');
    };
    
    this.reconnect = function () {
        dolog && console.log('reconnecting...');
        this.close(false);
        this.connect();
    };
    this.getClient = function () {
        return client;
    }
    
    if (ip) this.connect(ip);
};

module.exports = Y5;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function startListener(ip, port, callback) {
    var dgram = require('dgram');
    
    var socket = dgram.createSocket( {type: 'udp4', reuseAddr: true} );
    socket.on('error', function (err) {
        console.log(err.message);
    });
    socket.bind(port, '192.168.1.25', function () {
        //socket.bind(port, function () {
        //socket.setMulticastTTL(128);
        socket.setBroadcast(true);
        socket.addMembership(ip, '192.168.1.25');
        socket.setMulticastLoopback(true);
        
        if (callback) return callback(socket);
    });
    socket.on('message', function(msg, rinfo) {
        //console.log(rinfo.address);
        if (rinfo.address != '192.168.1.20') return;
        msg = msg.toString();
        var ar = msg.split('\r\n');
        //console.log(port + ' ' + msg);
        //console.log(ip + ':' + port + ' - ' + ar[2] + ' ' + ar[0]);
        msg = msg.replace(/\r\n/g, ' - ');
        console.log(ip + ':' + port);
        console.log(msg);
    });
};

// startListener('239.255.255.250', 1900);
// startListener('239.255.255.250', 1902);
// startListener('239.255.255.250', 0);
// startListener('239.255.250.250', 9131);
// startListener('224.0.0.251', 5353);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

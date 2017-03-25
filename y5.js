"use strict";

var net = require('net');
var log = undefined; //console.log;

var Y5 = function (ip, timeout, cb) {
    if (!(this instanceof Y5)) {
        return new Y5(ip, timeout, cb);
    }
    if (typeof ip === 'function') {
        cb = ip;
        ip = undefined;
        timeout = undefined;
    }
    if (typeof timeout === 'function') {
        cb = timeout;
        timeout = undefined;
    }
    function doCb(v) {
        cb && cb(v);
        cb = null;
    }
    this.setlog = this.setLog = function (bo) {
        log = (typeof bo === 'function') ? bo : bo ? console.log : undefined;
    };
    var self = this;
    var reconnectCnt = 0;
    var interval, client, reconnectTimer, connectTimer;
    var re = /@(.*):(.*)=(.*)/;
    
    this.pingMainPowerInterval = 30000;
    this.dataReceived = false;
    this.onEvent = function (event) {
    };
    this.onLine = function (line) {
        var a = re.exec(line);
        if (a && a.length > 3) {
            var obj = {
                section: a[1],
                state: a[2],
                value: a[3]
            };
            this.onEvent(obj);
        }
    };
    this.onData = function (data) {
        data = data.toString().replace(/\r\n$/, '');
        var ar = data.split('\r\n');
        ar.forEach(function (line) {
            this.onLine(line);
        }.bind(this));
    };
    this.onTimeout = function () {
    };
    
    client = new net.Socket();
    client.on('data', function (data) {
        log && log('Y5: on data: ' + data.toString().replace(/\r\n$/, ''));
        self.dataReceived = true;
        self.onData(data);
    });
    //client.on('end', function() {});
    client.on('error', function (error) {
        log && log('Y5: error: ' + error.errno + ' ' + error.message);
        var to = 3000;
        switch (error.errno) { //error.code
            case 'ETIMEDOUT':
                if (self.onTimeout() === true) return;
                to = 0;
                break;
            //case 'ECONNREFUSED': to = 1000; break;
            case 'ECONNRESET':
            case 'EPIPE':
                //to = reconnectCnt++ < 5 ? 500 : 3000;
                to = 2000;
                break;
            case 'ECANCELED': // called after destroy during connecting.
            default:
                return;
        }
        self.setReconnectTimer (to);
    });
    
    client.on('close', function (hadError) {
        self.dataReceived = false;
        log && log('Y5: Connection closed, hadError=' + hadError);
        doCb('close');
        if (hadError) self.setReconnectTimer(2000);
    });
    
    this.close = function (setClient2null) {
        clearReconnectTimer ();
        clearConnectTimer();
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        if (client) {
            client.destroy();
            //client.end();
        }
        if (setClient2null !== false) client = null;
        self.dataReceived = false;
    };
    
    client.on('connect', function() {
        clearConnectTimer ();
        log && log('Y5: on connect');
        reconnectCnt = 0;
        self.dataReceived = false;
        log && log('Y5: connected! ');
        self.send('@MAIN:PWR=?');
        self.send('@ZONE2:PWR=?');
        if (self.pingMainPowerInterval) interval = setInterval(function () {
            self.send('@MAIN:PWR=?');
        }, self.pingMainPowerInterval);
        doCb();
    });
    
    this.connect = function (_ip) {
        ip = _ip || ip;
        if (!client) return doCb ('client is null');
        if (client._connecting) {
            log && log('Y5: connect called during connecting. returning now');
            return doCb('is already in connection');
        }
        log && log('Y5: trying to connect... ');
        //if (timeout) client.setTimeout(timeout);
        if (timeout) self.setConnectTimer(timeout);

        client.connect(50000, ip, function () {
            // reconnectCnt = 0;
            // log && log('Y5: connected! ' + _no);
            // self.send('@MAIN:PWR=?');
            // self.send('@ZONE2:PWR=?');
            // if (self.pingMainPowerInterval) interval = setInterval(function () {
            //     self.send('@MAIN:PWR=?');
            // }, self.pingMainPowerInterval);
            // doCb();
        });
    };
    
    this.send = function (s) {
        if (!client.writable) {
            log && log('send called with writable=false');
        }
        client.write(s + '\r\n', function(err,d) {
            log && log('Y5: ' + s + ' written');
        });
    };
    
    this.reconnect = function () {
        log && log('Y5: reconnecting... ');
        reconnectTimer = null;
        this.close(false);
        this.connect();
    };
    
    function clearReconnectTimer() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    }
    this.setReconnectTimer = function(to) {
        log && log('Y5: setReconnectTimer (' + to + ')');
        clearReconnectTimer ();
        reconnectTimer = setTimeout(self.reconnect.bind(self), to);
    }
    function clearConnectTimer() {
        if (connectTimer) {
            clearTimeout(connectTimer);
            connectTimer = null;
        }
    }
    this.setConnectTimer = function(to) {
        clearConnectTimer ();
        connectTimer = setTimeout(function() {
            connectTimer = null;
            //self.reconnect.bind(self, 'timeout'), to
            log && log('Y5: on timeout');
            self.onTimeout();
        }, to);
    }
    
    this.powerConnected = function () {
        self.setReconnectTimer (10000);
        //reconnectTimer = setTimeout(this.reconnect.bind(this), 10000);
    };
    this.getClient = function () {
        return client;
    };
    
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

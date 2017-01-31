##y5
###Simple API for Yamaha Receiver 

[![NPM version](http://img.shields.io/npm/v/y5.svg)](https://www.npmjs.com/package/y5)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/soef/y5/blob/master/LICENSE)

<!--[![Tests](http://img.shields.io/travis/soef/y5.miele/master.svg)](https://travis-ci.org/soef/y5)-->


#### Description

Realtime Event API for Yamaha Receiver.

#### Important

Yamaha allows only one client connection at a time! 

####Some examples
Only listening on state changes:
```javascript
var Y5 = require('y5');

var y5 = Y5('192.168.1.30');
y5.onEvent = function(event) {
    console.log(JSON.stringify(event));
};

// some outputs:
// {"section":"MAIN","state":"VOL","value":"-33.5"}
// {"section":"MAIN","state":"VOL","value":"-33.0"}
// {"section":"MAIN","state":"VOL","value":"-32.5"}
// {"section":"MAIN","state":"PWR","value":"On"}
```
Sending:
```javascript
var Y5 = require('y5');
var yamahaIP = '192.168.1.30';

var y5 = Y5(yamahaIP, function (err) {
});
y5.onLine = function(line) {
    console.log(line);
};

// request a state value:
y5.send('@MAIN:PWR=?'); // as result onLine or onEvent will be called with the result

// set a state value:
y5.send('@MAIN:PWR=On');
//y5.close();
```
Here are some possible states
```javascript
some_possible_event_states = {
  "MAIN": {
    "PWR": "On",
    "AUDSEL": "Auto",
    "AVAIL": "Ready",
    "INP": "AV1",
    "MUTE": "Off",
    "PUREDIRMODE": "Off",
    "SOUNDPRG": "Action Game",
    "STRAIGHT": "Off",
    "VOL": "-34.0",
    "DECODERSEL": "Auto",
    "ENHANCER": "On",
    "CONTENTSDISP": "On",
    "2CHDECODER": "Dolby PLII Movie",
    "EXBASS": "Off",
    "TONETREBLE": "0.0"
  },
  "SYS": {
    "PWR": "On",
    "DMCCONTROL": "Enable",
    "HDMIOUT1": "On",
    "HDMIOUT2": "On",
    "PARTY": "Off",
    "SPPATTERN": "Pattern 1",
    "LIPSYNCSELINFO": "Analog",
    "LIPSYNCTOTALDELAYINFO": "0",
    "SPPATTERN2SURBCNFG": "",
    "SPPATTERN2FPRESCNFG": "",
    "SPPATTERN2SWFR2CNFG": "",
    "SPPATTERN2AMP": "7ch +2ZONE",
    "SPPATTERN2FRNTCNFG": "",
    "SPPATTERN2SWFR1CNFG": "",
    "SPPATTERN2SWFR2PHASE": "",
    "SPPATTERN2CENTCNFG": "",
    "HDMIVIDEOMODE": "Direct"
  },
  "online": {},
  "ZONE2": {
    "PWR": "Standby",
    "AVAIL": "Ready",
    "INP": "AV3",
    "MUTE": "Off",
    "VOL": "-40.0",
    "CONTENTSDISP": "Off"
  },
  "AIRPLAY": {
    "AVAIL": "Not Ready",
    "ALBUM": "",
    "ARTIST": "",
    "PLAYBACKINFO": "Stop",
    "SONG": "",
    "VOLINTERLOCK": "Limited"
  },
  "TUN": {
    "AVAIL": "Not Ready",
    "AMFREQ": "1080",
    "BAND": "FM",
    "FMFREQ": "94.10",
    "FMMODE": "Auto",
    "PRESET": "3",
    "RDSCLOCK": "",
    "RDSPRGSERVICE": "WDR2",
    "RDSPRGTYPE": "",
    "RDSTXTA": "",
    "RDSTXTB": "WDR 2",
    "SEARCHMODE": "Preset",
    "SIGSTEREOMONO": "Assert",
    "TUNED": "Assert"
  },
  "SERVER": {
    "AVAIL": "Not Ready",
    "ALBUM": "",
    "ARTIST": "",
    "LISTLAYER": "1",
    "LISTLAYERNAME": "Media Server",
    "LINE1TXT": "AVM FRITZ!Mediaserver",
    "LINE1ATRIB": "Container",
    "LINE2TXT": "192.168.1.80 - Sonos PLAY:1 Media Server",
    "LINE2ATRIB": "Container",
    "LINE3TXT": "192.168.1.74 - Sonos PLAY:1 Media Server",
    "LINE3ATRIB": "Container",
    "LINE4TXT": "192.168.1.33 - Sonos PLAY:1 Media Server",
    "LINE4ATRIB": "Container",
    "LINE5TXT": "192.168.1.75 - Sonos SUB Media Server",
    "LINE5ATRIB": "Container",
    "CURRLINE": "1",
    "MAXLINE": "8",
    "PLAYBACKINFO": "Stop",
    "REPEAT": "Off",
    "SHUFFLE": "Off",
    "SONG": ""
  },
  "NETRADIO": {
    "AVAIL": "Not Ready",
    "ALBUM": "",
    "LISTLAYER": "1",
    "LISTLAYERNAME": "NET RADIO",
    "LINE1TXT": "Lesezeichen",
    "LINE1ATRIB": "Container",
    "LINE2TXT": "Länder",
    "LINE2ATRIB": "Container",
    "LINE3TXT": "Musikrichtungen",
    "LINE3ATRIB": "Container",
    "LINE4TXT": "Neue Sender",
    "LINE4ATRIB": "Container",
    "LINE5TXT": "Populäre Sender",
    "LINE5ATRIB": "Container",
    "LINE6TXT": "Podcasts",
    "LINE6ATRIB": "Container",
    "LINE7TXT": "Hilfe",
    "LINE7ATRIB": "Container",
    "LINE8TXT": "",
    "LINE8ATRIB": "Unselectable",
    "CURRLINE": "1",
    "MAXLINE": "7",
    "PLAYBACKINFO": "Stop",
    "SONG": "",
    "STATION": ""
  },
  "SPOTIFY": {
    "AVAIL": "Not Ready",
    "ALBUM": "",
    "ARTIST": "",
    "PLAYBACKINFO": "Stop",
    "TRACK": ""
  },
  "ZONE3": {
    "PWR": "Standby",
    "AVAIL": "Ready",
    "INP": "AV1",
    "MUTE": "Off",
    "VOL": "-40.0"
  },
  "ZONE4": {
    "PWR": "Standby",
    "AVAIL": "Ready",
    "INP": "AV1"
  }
};
```

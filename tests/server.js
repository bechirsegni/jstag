/* eslint-env node */

var express = require('express');
var colors = require('colors/safe');
var gif = new Buffer([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x2c,
  0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
  0x02, 0x44, 0x01, 0x00, 0x3b ]);

module.exports = class Server {
  constructor(port, debugMode) {
    this.port = port || 3002;
    this.app = express();
    this.server = null;
    this.debugMode = debugMode || false;

    // This is the endpoint used for the `getid` request
    this.app.get('/cid/:account_id', (req, res) => {
      this.log(`serving a dummy id`);

      res.jsonp('dummy');
    });

    // This is the endpoint used to handle the `Gif` transport with or without a stream ID
    this.app.get('/c/:account_id*', (req, res) => {
      this.log('serving 1x1 a transparent gif response');

      res.send(gif, { 'Content-Type': 'image/gif' }, 200);
    });

    this.app.post('/c/:account_id*', (req, res) => {
      this.log("serving a text response");

      res.send('');
    });
  }

  open(onListening) {
    this.server = this.app.listen(this.port, onListening);
  }

  close() {
    if (this.server != null) {
      this.server.close();
      this.server = null;
    }
  }

  log(/* message */) {
    if (this.debugMode) {
      /* eslint-disable no-console */
      console.log.apply(console, [ colors.blue("Test Server:") ].concat([].slice.call(arguments), '\n'));
      /* eslint-enable no-console */
    }
  }
};

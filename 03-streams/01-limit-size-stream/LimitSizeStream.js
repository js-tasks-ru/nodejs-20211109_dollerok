const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.encoding = options.encoding;
    this.currentBytes = 0;
  }

  _transform(chunk, encoding, callback) {
    this.currentBytes += chunk.length;
    if (this.currentBytes <= this.limit) {
      callback(null, chunk);
    } else {
      callback(new LimitExceededError);
    }
  }
}

module.exports = LimitSizeStream;

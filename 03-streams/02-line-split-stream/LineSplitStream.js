const stream = require('stream');
const os = require('os');

var lastElement = '';

class LineSplitStream extends stream.Transform {

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    if (lastElement) {
      chunk = lastElement + chunk;
    }

    var elements = chunk.toString().split(os.EOL);
    lastElement = elements.pop();
    
    if (elements != 0) {
      elements.forEach((element) => {
        this.push(element);
      });
    }

    callback();
  }

  _flush(callback) {
    if (lastElement) {
      this.push(lastElement);
    };
    lastElement = '';

    callback();
  }
}

module.exports = LineSplitStream;

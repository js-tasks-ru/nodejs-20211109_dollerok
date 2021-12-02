const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.indexOf('/') > -1) {
    res.statusCode = 400;
    res.end('Do not support nesting.');
  };

  switch (req.method) {
    case 'DELETE':
      readStream = fs.createReadStream(filepath);

      readStream.on('error', (err) => {
        if (err.code == 'ENOENT') {
          res.statusCode = 404;
          res.end('File not found.');
        } else {
          res.statusCode = 500;
          res.end('Read file error.');
        }
      });
      readStream.on('open', () => {
        fs.unlink(filepath, (err) => {
          res.statusCode = 500;
          res.end('Delete file error');
        });
        readStream.destroy();
        res.statusCode = 200;
        res.end('Success');
      })
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

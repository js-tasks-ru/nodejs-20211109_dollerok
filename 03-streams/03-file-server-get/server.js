const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();
var fileData = '';

function ErrorHandler(readStream, res, statusCode, resMsg) {
  readStream ? readStream.destroy() : null;
  statusCode ? res.statusCode = statusCode : null;
  resMsg ? res.end(resMsg) : null;
  fileData = '';
}

server.on('request', (req, res) => {
  server.on('clientError', () => {
    ErrorHandler(stream, null, null, null);
  });
  server.on('error', (error) => {
    ErrorHandler(stream, res, 500, 'Some error on server.');
  })

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':

      let stream = fs.createReadStream(filepath);

      if (pathname.lastIndexOf("/") > -1) {
        ErrorHandler(stream, res, 400, 'Do not support nesting.');
      }

      stream.on('error', (error) => {
        if (error.code == 'ENOENT') {
          ErrorHandler(stream, res, 404, 'File not found.');
        } else {
          ErrorHandler(stream, res, 500, 'Read file error.');
        }
      })

      stream.on('data', (chunk) => {
        fileData += chunk;
      });

      stream.on('end', () => {
        res.end(fileData);
        fileData = '';
      })
      break;

    default:
      ErrorHandler(stream, res, 501, 'Not implemented');
  }
});

module.exports = server;

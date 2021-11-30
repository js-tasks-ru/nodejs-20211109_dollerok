const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSize = require('./LimitSizeStream');

const server = new http.Server();

async function ErrorHandler(writeStream, filepath, res, statusCode, resMsg) {
  writeStream ? await writeStream.destroy() : null;
  if (filepath) {
    await fs.unlink(filepath, (err) => {
      res.statusCode = 500;
      res.end('File delete error.');
    });
  };
  statusCode ? res.statusCode = statusCode : null;
  resMsg ? res.end(resMsg) : null;
}

server.on('request', (req, res) => {

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.indexOf('/') > -1) {
    ErrorHandler(null, null, res, 400, 'Do not support nesting.');
  }

  switch (req.method) {
    case 'POST':
        fs.exists(filepath, (exists) => {
          if (!exists) {
            var streamWrite = fs.createWriteStream(filepath);
            var limitSize = new LimitSize({limit: 1024*1024});

            req.on('error', async (err) => {
              await ErrorHandler(streamWrite, filepath, res, 500, 'File read error.');
            }).pipe(limitSize).on('error', async (err) => {
              await ErrorHandler(streamWrite, filepath, res, 413, 'Limit size.');
            }).pipe(streamWrite).on('error', async (err) => {
              await ErrorHandler(streamWrite, filepath, res, 500, 'File write error.');
            });

            req.on('aborted', async () => {
              await ErrorHandler(streamWrite, filepath, res, 500, 'Request aborted.');
            });
            streamWrite.on('finish', () => {
              ErrorHandler(null, null, res, 201, 'Request aborted.');
            })
          } else {
            ErrorHandler(null, null, res, 409, 'File exists.');
          }
        })

      break;

    default:
      ErrorHandler(null, null, res, 501, 'Not implemented');
  }
});

module.exports = server;
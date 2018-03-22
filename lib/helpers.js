'use strict';

const fs = require('fs');
const readline = require('readline');
const path = require('path');
const lz4 = require('lz4');

function readlines(file) {
  return new Promise((accept, reject) => {
    const lines = [];
    const stream = fs.createReadStream(file);
    readline.createInterface({
      input: stream
    }).on('line', line => {
      if (line.length > 0) {
        lines.push(line);
      }
    });
    stream
      .on('end', () => accept(lines))
      .on('error', reject);
  });
}

function promiseEvent(obj, finish = 'end', error = 'error') {
  return new Promise((accept, reject) => {
    obj.on(finish, accept);
    obj.on(error, reject);
  });
}

function packedIn(file, compress = true) {
  const stream = fs.createReadStream(`${file}${compress ? '.lz4' : ''}`);
  if (!compress) {
    return stream;
  }
  const encoder = lz4.createDecoderStream();
  return stream.pipe(encoder);
}

module.exports = {
  readlines,
  promiseEvent,
  packedIn,
};

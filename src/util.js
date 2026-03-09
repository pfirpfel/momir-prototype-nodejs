const https = require('https');
const fs = require('fs');

exports.downloadFile = async function(uri, targetPath) {
  const file = fs.createWriteStream(targetPath);
  return new Promise((resolve, reject) => {
    https.get(uri, (response) => {
      const { statusCode } = response;
      if (statusCode !== 200) {
        return reject(new Error(`Status Code: ${statusCode}`));
      }
      response.on('end', resolve);
      response.pipe(file);
    });
  });
};

exports.fileExists = async function(path) {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.F_OK, (err) => {
      resolve(err === null);
    });
  });
};

exports.writeFile = async function(data, path) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

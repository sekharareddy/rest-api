const fs = require("fs");
const path = require("path");
const fsE = require("fs-extra");

const createDirRecursive = async (path) => new Promise((resolve, reject) => {
  fsE.ensureDir(path, ((err) => {
    if (err) { reject(err); } else { resolve(); }
  }));
});

const listFiles = async (dir) => new Promise((res, rej) => {
  fs.readdir(dir, (err, list) => {
    if (err) {
      rej(err);
    } else {
      res(list.filter((file) => !fs.statSync(path.join(dir, file)).isDirectory()));
    }
  });
});

const uploadBlob = async function (blobName, file) {
  try {
    console.log("");
    // create folder path if not exists
    const rootPath = process.env.FILE_SHARE_PATH || "";
    const blobPath = blobName.substring(0, blobName.lastIndexOf("/"));
    createDirRecursive(path.join(rootPath, blobPath));

    // write file to shared folder path
    const f = fs.openSync(path.join(rootPath, blobName), "w");
    fs.writeSync(f, Buffer.from(file.buffer));
    fs.closeSync(f);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getBlobList = async function (prefix) {
  const list = [];
  try {
    console.log("");
    // recursively list files
    // for each file, create blobItem object  and push list
  } catch (err) {
    console.error(err);
  }
  return list;
};

const deleteBlob = async function (blobName) {
  try {
    console.log("");
    // delete file if exists
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = {
  uploadBlob,
  getBlobList,
  deleteBlob,
};

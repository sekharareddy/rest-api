
if (process.env.STORAGE_TYPE && process.env.STORAGE_TYPE === "FileShare") {
  const { uploadBlob, getBlobList, deleteBlob } = require("./fileShareClient");
  module.exports = {
    uploadBlob,
    getBlobList,
    deleteBlob,
  };
} else {
  const { uploadBlob, getBlobList, deleteBlob } = require("./azureBlobClient");
  module.exports = {
    uploadBlob,
    getBlobList,
    deleteBlob,
  };
}

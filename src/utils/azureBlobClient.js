const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");

const getResourcesContainerClient = async function () {
  const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const containerName = process.env.AZURE_STORAGE_RESOURCES_CONTAINER_NAME;
  const defaultAzureCredential = new DefaultAzureCredential();
  const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    defaultAzureCredential,
  );
  return blobServiceClient.getContainerClient(containerName);
};

const uploadBlob = async function (blobName, file) {
  const containerClient = await getResourcesContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(file.buffer);
};

const getBlobList = async function (prefix) {
  const list = [];
  try {
    const containerClient = await getResourcesContainerClient();
    const iterator = containerClient.listBlobsFlat({ prefix }).byPage({ maxPageSize: 50 });
    let response = (await iterator.next()).value;
    list.push(response.segment.blobItems);
    while (response.continuationToken) {
      response = (await iterator.next()).value;
      list.push(response.segment.blobItems);
    }
  } catch (err) {
    console.error(prefix, err);
  }
  return list;
};

const deleteBlob = async function (blobName) {
  try {
    const containerClient = await getResourcesContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
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

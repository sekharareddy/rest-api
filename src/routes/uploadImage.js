//Express related backend imports
const express = require("express");
const router = express.Router();
const HttpStatus = require("../utils/http_codes.json");
const multer = require('multer');
const fs = require('fs');

// Logger
// const logger = require("../utils/logger");

const { getBlobList, uploadBlob, deleteBlob } = require("../utils/storageUtils");

//Response Handler
const QueryResult = require("../utils/QueryResult").QueryResult;
const { returnStateHandler } = require("../utils/returnStateHandler");

const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file');

router.get("/", async (req, res, next) => {
    console.log("/image GET call");
    try {
        let images = [];
        let data = await getBlobList(req.query['appId']);
        data.sort((a, b) => Date.parse(b.lastModified) - Date.parse(a.lastModified))
        data.forEach(blobs => {
            blobs.forEach(blob => {
                let ext = blob?.name?.substr(blob.name.lastIndexOf("."), blob.name.length);
                ext = ext.toLowerCase()
                if (ext == ".png" || ext == ".jpg" || ext == ".gif" || ext == ".svg") {
                    let fileUrl = process.env.CDN_ENDPOINT_URL + (blob.name.replace(/ /g, "%20"))
                    images.push(
                        {
                            fileUrl: fileUrl,
                            fileName: blob.name,
                            creationTime: blob.properties.createdOn,
                            lastModified: blob.properties.lastModified
                        });
                }
            })
        })
        next(new QueryResult(images));
    }
    catch (err) {
        next({ error: err, status: HttpStatus.BAD_REQUEST });
    }
}, returnStateHandler);

router.post('/', uploadStrategy, async (req, res, next) => {
    console.log('uploadImage POST Call..')
    try {
        const blobName = `${req.query['appId']}/${req.file.originalname}`;
        await uploadBlob(blobName, req.file);
        let fileUrl = process.env.CDN_ENDPOINT_URL + blobName
        next(new QueryResult({ fileUrl: fileUrl, fileName: blobName }));
    }
    catch (err) {
        console.log(err)
        next({ error: err, status: HttpStatus.BAD_REQUEST });
    }
}, returnStateHandler);

router.delete("/", async (req, res, next) => {
    console.log("/image delete call");
    try {
        let fileName = req.query['fileName'] ? req.query['fileName'] : req.body.fileName
        if (!fileName) {
            throw new Error("fileName required!");
        }
        fileName = req.query['appId'] + "/" + fileName
        await deleteBlob(fileName)
        next (new QueryResult());
    }
    catch (err) {
        next({ error: err, status: HttpStatus.BAD_REQUEST });
    }
}, returnStateHandler);

module.exports = router;

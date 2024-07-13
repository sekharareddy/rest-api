// Express related backend imports
const express = require("express");

const router = express.Router();
const multer = require("multer");
const HttpStatus = require("../utils/http_codes.json");
const { uploadBlob } = require("../utils/storageUtils");

// Response Handler
const { QueryResult } = require("../utils/QueryResult");
const { returnStateHandler } = require("../utils/returnStateHandler");

// Entity model methods
const { create, del, getById, get, update, validate } = require("../models-mssql/ApplicationDocument");

const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single("file");

router.get("/", async (req, res, next) => {
  console.log("/ApplicationDocument GET call");
  try {
    if (req.query.applicationId) {
      const data = await get(req.query.applicationId);
      next(new QueryResult(data));
    } else {
      next({ error: "applicationId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/ApplicationDocument GET/:id call");
  try {
    const data = await getById(req.params.id);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/:applicationId", uploadStrategy, async (req, res, next) => {
  try {
    console.log("/ApplicationDocument POST call");
    let fileType = "";
    if (req.file.mimetype === "application/pdf") {
      fileType = ".pdf";
    }
    const blobName = `${req.user.appId}/${req.file.originalname}-${Date.now()}${fileType}`;
    await uploadBlob(blobName, req.file.buffer);

    // prepare body
    const file = (req.file ? req.file.blob ? req.file.blob : blobName : blobName);
    const filePath = req.params.applicationId;
    const fileUrl = process.env.CDN_ENDPOINT_URL + file;
    const appDoc = {
      originalFileName: (req.file && req.file.hasOwnProperty("originalname") ? req.file.originalname : ""),
      fileName: file,
      filePath,
      fileURL: fileUrl,
      docType: req.body.docType || "",
      applicationId: req.params.applicationId,
    };
    await validate(appDoc).then(async (dataIn) => {
      dataIn = await create(dataIn);
      next(new QueryResult(dataIn));
    }).catch((err) => {
      next({ error: err, status: HttpStatus.BAD_REQUEST });
    });
  } catch (err) {
    next({ error: err, status: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/ApplicationDocument PUT call", req.params.id);
  // prepare body
  // console.log('req.body: ', req.body);
  await validate(req.body, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.delete(
  "/:id",
  async (req, res, next) => {
    console.log("/ApplicationDocument DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

module.exports = router;

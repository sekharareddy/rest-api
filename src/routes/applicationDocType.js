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
const { create, del, getById, get, update, validate } = require("../models-mssql/ApplicationDocType");

const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single("file");

router.get("/", async (req, res, next) => {
  console.log("/ApplicationDocType GET call");
  try {
    const data = await get(req.query.tenantId, req.query.appId, req.query.orgId);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/ApplicationDocType GET/:id call");
  try {
    const data = await getById(req.params.id);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/", uploadStrategy, async (req, res, next) => {
  console.log("/ApplicationDocType POST call");

  let fileType = "";
  if (req.file.mimetype === "application/pdf") {
    fileType = ".pdf";
  }
  const blobName = `${req.user.appId}/${req.file.originalname}-${Date.now()}${fileType}`;
  await uploadBlob(blobName, req.file.buffer);

  // prepare body
  const file = (req.file ? req.file.blob ? req.file.blob : blobName : blobName);
  const filePath = req.user.appId;
  const fileUrl = process.env.CDN_ENDPOINT_URL + file;
  const appDoc = {
    originalFileName: (req.file && req.file.hasOwnProperty("originalname") ? req.file.originalname : ""),
    fileName: file,
    filePath,
    fileURL: fileUrl,
    docType: req.body.docType || "",
    appId: req.user.appId,
    orgId: req.query.orgId,
  };
  await validate(appDoc, req.user).then(async (dataIn) => {
    dataIn = await create(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/ApplicationDocType PUT call", req.params.id);
  // prepare body
  // console.log('req.body: ', req.body);
  await validate(req.body, req.user, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.delete(
  "/:id",
  async (req, res, next) => {
    console.log("/ApplicationDocType DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

module.exports = router;

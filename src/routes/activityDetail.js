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
const { create, update, del, get, getById, validate } = require("../models-mssql/ActivityDetail");

const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single("file");

router.get("/", async (req, res, next) => {
  console.log("/activityDetail GET call");
  try {
    const data = await get(req.user, req.query.activityId);
    next(new QueryResult(data));
  } catch (err) {
    console.log(err);
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/image", uploadStrategy, async (req, res, next) => {
// router.post("/image",upload.single('file'),async function(req,res,next){
  console.log("/activityDetail/image POST call");

  const fileType = req.file.mimetye.split("/")[1];
  const blobName = `${req.user.appId}/${req.file.originalname}-${Date.now()}${fileType}`;
  await uploadBlob(blobName, req.file.buffer);

  // prepare body
  const filePath = req.params.activityDetailId;
  const fileUrl = process.env.CDN_ENDPOINT_URL + blobName;
  const acitityDetailDoc = {
    activityId: req.body.activityId,
    activityDetailType: "image",
    activityDetailLabel: req.body.activityDetailLabel,
    activityDetailDescription: fileUrl,
    activityDetailNotes: req.body.activityDetailNotes,
  };
  await validate(acitityDetailDoc, req.user).then(async (dataIn) => {
    dataIn = await create(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.post("/", async (req, res, next) => {
  console.log("/activityDetail POST call");

  await validate(req.body, req.user).then(async (dataIn) => {
    dataIn = await create(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/activityDetail/:id PUT call", req.params.id);

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
    console.log("/api/activityDetail DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

module.exports = router;

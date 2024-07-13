// Express related backend imports
const express = require("express");

const router = express.Router();
const HttpStatus = require("../utils/http_codes.json");

// Logger
const logger = require("../utils/logger");

// Response Handler
const { QueryResult } = require("../utils/QueryResult");
const { returnStateHandler } = require("../utils/returnStateHandler");

// Entity model methods
const { create, del, getById, get, update, validate } = require("../models-mssql/PickupPermission");

router.get("/", async (req, res, next) => {
  console.log("/PickupPermission GET call");
  try {
    const data = await get(req.user.userId);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/PickupPermission GET call");
  try {
    const data = await getById(req.params.id, req.user.userId);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/PickupPermission PUT call", req.params.id);
  // prepare body
  // console.log('req.body: ', req.body);
  await validate(req.body, req.user.userId, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

module.exports = router;

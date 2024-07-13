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
const { create, update, validate } = require("../models-mssql/UserSession");

router.post("/", async (req, res, next) => {
  console.log("/userSession POST call");

  // prepare body
  const body = { tenantId: req.query.tenantId, appId: req.query.appId, userId: req.user.userId };
  await validate(body).then(async (dataIn) => {
    dataIn = await create(dataIn, req.user);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/api/userSession PUT call", req.params.id);
  // prepare body
  const body = { tenantId: req.query.tenantId, appId: req.query.appId, userId: req.user.userId };
  await validate(body, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.delete("/:id", async (req, res, next) => {
  console.log("/api/userSession DELETE call", req.params.id);
  // prepare body
  const body = { tenantId: req.query.tenantId, appId: req.query.appId, userId: req.user.userId };
  await validate(body, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

module.exports = router;

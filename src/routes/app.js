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
const { create, update, get, getById, validate } = require("../models-mssql/App");

router.get("/", async (req, res, next) => {
  console.log("/app GET call", req.query.tenantId);
  try {
    if (req.query.tenantId && req.query.appId) {
      const data = await getById(req.query.tenantId, req.query.appId);
      next(new QueryResult(data));
    } else {
      next({ error: err, status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/app GET call", req.params.id);
  try {
    if (req.query.tenantId && req.params.id) {
      const data = await getById(req.query.tenantId, req.params.id);
      next(new QueryResult(data));
    } else {
      next({ error: err, status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/", async (req, res, next) => {
  console.log("/app POST call");
  await validate(req.body).then(async (dataIn) => {
    dataIn = await create(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/api/app PUT call", req.params.id);
  await validate(req.body, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

module.exports = router;

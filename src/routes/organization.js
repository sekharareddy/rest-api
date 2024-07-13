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
const { create, del, getById, get, update, validate } = require("../models-mssql/Organization");

router.get("/", async (req, res, next) => {
  console.log("/org GET call");
  try {
    if (req.query.tenantId && req.query.appId) {
      const data = await get(req.query.tenantId, req.query.appId);
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
  console.log("/Org GET call");
  try {
    const data = await getById(req.query.tenantId, req.query.appId, req.params.id);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/", async (req, res, next) => {
  console.log("/Org POST call");
  // prepare body
  // let body;
  await validate(req.body).then(async (dataIn) => {
    if (req.user.appId != dataIn.appId || req.user.tenantId != dataIn.tenantId) { return next({ error: new Error("Invalid tenant / app!"), status: HttpStatus.BAD_REQUEST }); }

    dataIn = await create(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/Org PUT call", req.params.id);
  // prepare body
  // console.log('req.body: ', req.body);
  await validate(req.body, req.params.id).then(async (dataIn) => {
    if (req.user.appId != dataIn.appId || req.user.tenantId != dataIn.tenantId) { return next({ error: new Error("Invalid tenant / app!"), status: HttpStatus.BAD_REQUEST }); }

    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.delete(
  "/:id",
  async (req, res, next) => {
    console.log("/Org DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

module.exports = router;

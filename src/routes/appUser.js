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
const { create, del, getById, get, update, validate } = require("../models-mssql/AppUser");

router.get("/", async (req, res, next) => {
  console.log("/appUser GET call", req.query.tenantId);
  try {
    if (req.query.tenantId && req.query.appId) {
      const data = await get(req.query);
      next(new QueryResult(data));
    } else {
      next({ error: "tenantId and appId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/AppUser GET call");
  try {
    if (req.query.tenantId && req.query.appId) {
      const data = await getById(req.query.tenantId, req.query.appId, req.params.id);
      next(new QueryResult(data));
    } else {
      next({ error: "tenantId and appId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/", async (req, res, next) => {
  console.log("/AppUser POST call");
  // prepare body
  // let body;
  await validate(req.body).then(async (dataIn) => {
    dataIn = await create(dataIn, req.query.tenantId, req.query.appId, req.query.orgId, req.user, req.headers.tokensource);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/AppUser PUT call", req.params.id);
  // prepare body
  // console.log('req.body: ', req.body);
  await validate(req.body, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.delete(
  "/:id",
  async (req, res, next) => {
    console.log("/AppUser DELETE call", req.params.id);
    if (req.query.tenantId && req.query.appId) {
      const data = await del(req.query.tenantId, req.query.appId, req.params.id);
      next(new QueryResult(data));
    } else {
      next({ error: "tenantId and appId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
  },
  returnStateHandler,
);

module.exports = router;

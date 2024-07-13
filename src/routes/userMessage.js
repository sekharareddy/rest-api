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
const { create, del, get, getById, validate } = require("../models-mssql/UserMessage");

router.get("/", async (req, res, next) => {
  console.log("/UserMessage GET call", req.query);
  try {
    if (req.query.tenantId && req.query.appId
            && req.query.orgId) {
      const data = await get(req.query.tenantId, req.query.appId, req.query.roleId, req.user);
      next(new QueryResult(data));
    } else {
      next({ error: "tenantId/ appId/ roleId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/UserMessage GET call");
  try {
    const data = await getById(req.params.id);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/", async (req, res, next) => {
  console.log("/UserMessage POST call");
  // prepare body
  if (!req.body.tenantId || req.body.tenantId === null) { req.body.tenantId = req.query.tenantId; }
  if (!req.body.appId || req.body.appId === null) { req.body.appId = req.query.appId; }
  req.body.userId = req.user.userId;
  await validate(req.body).then(async (dataIn) => {
    dataIn = await create(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/api/UserMessage PUT call", req.params.id);
  // prepare body
  // let body;
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
    console.log("/UserMessage DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

module.exports = router;

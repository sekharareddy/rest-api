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
const { create, del, update, get, getById, validate } = require("../models-mssql/UserFamily");

router.get("/", async (req, res, next) => {
  console.log("/userFamily GET call", req.query.tenantId);
  try {
    if (req.user.userId) {
      const data = await get(req.user.userId);
      next(new QueryResult(data));
    } else {
      return next({ error: new Error("Unauthorized!"), status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/userFamily GET call");
  try {
    const data = await getById(req.params.id);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/", async (req, res, next) => {
  console.log("/userFamily POST call");
  // prepare body
  // let body;
  await validate(req.body, req.user.userId).then(async (dataIn) => {
    dataIn = await create(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/userFamily PUT call");
  // prepare body
  // console.log('req.body: ', req.body);
  await validate(req.body, req.user.userId, req.params.id).then(async (dataIn) => {
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
    console.log("/userFamily DELETE call");
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

module.exports = router;

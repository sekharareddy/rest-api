// Express related backend imports
const express = require("express");

const router = express.Router();
const HttpStatus = require("../utils/http_codes.json");

// Logger
// const logger = require("../utils/logger");

// Response Handler
const { QueryResult } = require("../utils/QueryResult");
const { returnStateHandler } = require("../utils/returnStateHandler");

// Entity model methods
const { create, update, get, getById, del } = require("../models-mssql/ElementTypeProperties");
const { validate } = require("../models-mssql/validateElementTypeProperty");
// const  getEmployeeTypeById  = require("../models-mssql/ElementTypes").getById;

router.post("/", async (req, res, next) => {
  console.log("/api/elementTypeProperties POST call");
  await validate(req.body).then(async (dataIn) => {
    dataIn = await create(dataIn, req.query.tenantId, req.query.appId);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/api/elementTypeProperties PUT call", req.params.id);
  await validate(req.body, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/", async (req, res, next) => {
  console.log("/api/elementTypeProperties PUT call");
  await validate(req.body).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);
router.delete("/:id", async (req, res, next) => {
  console.log("/api/elementTypeProperties DELETE call", req.params.id);
  const data = await del(req.params.id);
  next(new QueryResult(data));
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/api/ElementTypeProperty GET/{id} call");
  try {
    const data = await getById(req.params.id);
    next(new QueryResult(data));
  } catch (err) {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/", async (req, res, next) => {
  console.log("/elementTypeProperty GET call", req.query.elementTypeId);
  try {
    if (req.query.elementTypeId) {
      const data = await get(req.query.elementTypeId);
      next(new QueryResult(data));
    } else {
      next({ error: "elementTypeId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

module.exports = router;

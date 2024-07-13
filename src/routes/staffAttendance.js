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
const { create, update, get, getReportData, getById, validate } = require("../models-mssql/StaffAttendance");

router.get("/", async (req, res, next) => {
  console.log("/staffAttendance GET call");
  try {
    let data;
    if (req.query && req.query.roleId) {
      data = await get(req.user, req.query);
    } else {
      console.log("invalid parameters, returning []");
      data = [];
    }
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/report", async (req, res, next) => {
  console.log("/staffAttendance/report GET call");
  try {
    let data;
    if (req.query && req.query.roleId) {
      data = await getReportData(req.user, req.query);
    } else {
      console.log("invalid parameters, returning []");
      data = [];
    }
    console.log(45, data);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/staffAttendance GET/:id call");
  try {
    const data = await getById(req.params.id);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/", async (req, res, next) => {
  console.log("/staffAttendance POST call");

  await validate(req.query, req.body, req.user).then(async (dataIn) => {
    if (dataIn.message && dataIn.success === false) {
      // next(new QueryResult(dataIn));
      next({ error: dataIn.message, success: false, status: HttpStatus.BAD_REQUEST });
    } else {
      dataIn = await create(dataIn);
      next(new QueryResult(dataIn));
    }
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/staffAttendance/:id PUT call", req.params.id);

  await validate(req.query, req.body, req.user, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/", async (req, res, next) => {
  console.log("/staffAttendance PUT call");

  await validate(req.query, req.body, req.user).then(async (dataIn) => {
    dataIn = await update(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

module.exports = router;

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
const { create, update, del, get, getById, validate } = require("../models-mssql/Activity");

router.get("/", async (req, res, next) => {
  console.log("/activity GET call");
  try {
    const data = await get(req.user, req.query);
    next(new QueryResult(data));
  } catch (err) {
    console.log(err);
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

// router.get("/:id", async function (req, res, next) {
//     console.log("/activity GET/:id call")
//     try {
//         let data = await getById(req.params.id)
//         next(new QueryResult(data));
//     }
//     catch (err) {
//         next({ error: err, status: HttpStatus.BAD_REQUEST });
//     }
// }, returnStateHandler)

router.post("/", async (req, res, next) => {
  console.log("/activity POST call");

  await validate(req.body, req.user).then(async (dataIn) => {
    dataIn = await create(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/activity/:id PUT call", req.params.id);

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
    console.log("/api/acitivy DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

module.exports = router;

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
const { get, validate, create, update, del } = require("../models-mssql/StaffLeaveRequest");

router.get("/", async (req, res, next) => {
  console.log("/StaffLeaveRequest GET call");
  try {
    const data = await get(req.query, req.user);
    next(new QueryResult(data));
  } catch (err) {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

// router.get("/:id",async function(req,res,next){
//   console.log("/StaffLeaveRequest GET call")
//   try{
//       let data = await getById(req.params.id)
//     next(new QueryResult(data));
//   }
//   catch(err){
//     // err.status = HttpStatus.BAD_REQUEST;
//     next({error:err,status:HttpStatus.BAD_REQUEST});
//   };
// },returnStateHandler)

router.post("/", async (req, res, next) => {
  console.log("/StaffLeaveRequest POST call");
  await validate(req.body).then(async (dataIn) => {
    dataIn = await create(dataIn, req.user, req.query);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.delete("/:id", async (req, res, next) => {
  console.log("/StaffLeaveRequest DELETE call", req.params.id);
  const data = await del(req.params.id, req.query, req.user);
  next(new QueryResult(data));
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/StaffLeaveRequest PUT call", req.params.id);
  await validate(req.body, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn, req.query, req.user);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.patch("/:id", async (req, res, next) => {
  console.log("/StaffLeaveRequest PUT call", req.params.id);
  await validate(req.body, req.params.id).then(async (dataIn) => {
    dataIn = await update(dataIn, req.query, req.user);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

module.exports = router;

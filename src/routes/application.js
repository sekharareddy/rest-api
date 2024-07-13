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
const { create, del, getById, get, update, validate } = require("../models-mssql/Application");

router.get("/", async (req, res, next) => {
  console.log("/appl GET call");
  try {
    if (req.query.tenantId && req.query.appId && req.query.orgId && req.query.roleId) {
      const data = await get(req.query, req.user);
      next(new QueryResult(data));
    } else {
      next({ error: "tenantId, appId and orgId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/appl GET call");
  try {
    if (req.query.tenantId && req.query.appId && req.query.orgId && req.user) {
      const data = await getById(req.query.tenantId, req.query.appId, req.query.orgId, req.user, req.params.id);
      next(new QueryResult(data));
    } else {
      next({ error: "tenantId and appId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
    // let data = await getById(req.params.id,req.user)
    // next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/", async (req, res, next) => {
  console.log("/appl POST call");
  // prepare body
  // let body;
  await validate(req.body, req.user.userId).then(async (dataIn) => {
    if (req.user.appId != dataIn.appId || req.user.tenantId != dataIn.tenantId) { return next({ error: new Error("Invalid tenant / app!"), status: HttpStatus.BAD_REQUEST }); }

    dataIn = await create(dataIn, req.user);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/appl PUT call", req.params.id);
  // prepare body
  // console.log('req.body: ', req.body);
  await validate(req.body, req.user.userId, req.params.id).then(async (dataIn) => {
    if (req.user.appId != dataIn.appId || req.user.tenantId != dataIn.tenantId) { return next({ error: new Error("Invalid tenant / app!"), status: HttpStatus.BAD_REQUEST }); }

    dataIn = await update(dataIn, req.user, req.query);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.delete("/:id", async (req, res, next) => {
  console.log("/appl PUT call", req.params.id);
  // prepare body
  reqbody = {
    tenantId: req.query.tenantId,
    appId: req.query.appId,
    orgId: req.query.orgId,
    applicationId: req.params.id,
    userId: req.user.userId,
    isDeleted: 1,
  };
  try {
    dataIn = await update(reqbody, req.user, req.query);
    next(new QueryResult(dataIn));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

// router.delete(
// 	"/:id",
// 	async function (req, res, next) {
// 		console.log("/appl DELETE call", req.params.id);
//     if (req.query["tenantId"] && req.query["appId"]){
//       let data = await del(req.query["tenantId"], req.query["appId"], req.user.userId, req.params.id);
//       next(new QueryResult(data));
//     }
//     else{
//       next({error:"tenantId and appId can not be null!",status:HttpStatus.BAD_REQUEST});
//     }
// 	},
// 	returnStateHandler
// );

module.exports = router;

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
const { create, del, update, get, getById, validate } = require("../models-mssql/UserRole");

router.get("/", async (req, res, next) => {
  console.log("/userRole GET call", req.query.tenantId);
  try {
    if (req.query.tenantId && req.query.appId) {
      const data = await get(req.query.tenantId, req.query.appId);
      next(new QueryResult(data));
    } else {
      next({ error: "tenantId and appId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.get("/:id", async (req, res, next) => {
  console.log("/userRole GET call");
  try {
    const data = await getById(req.params.id);
    next(new QueryResult(data));
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

router.post("/", async (req, res, next) => {
  console.log("/userRole POST call");
  let roleCheck = false;
  if (req.user && req.user.userRoles) {
    req.user.userRoles.forEach((userRole) => {
      if (userRole.roleName == "SysAdmin" || userRole.roleName == "AppAdmin") {
        roleCheck = true;
      }
    });
  }
  if (!roleCheck) {
    return next({ error: new Error("Unauthorized!"), status: HttpStatus.BAD_REQUEST });
  }
  // prepare body
  if (!req.body.tenantId || req.body.tenantId === null) { req.body.tenantId = req.query.tenantId; }
  if (!req.body.appId || req.body.appId === null) { req.body.appId = req.query.appId; }
  await validate(req.body).then(async (dataIn) => {
    dataIn = await create(dataIn);
    next(new QueryResult(dataIn));
  }).catch((err) => {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  });
}, returnStateHandler);

router.put("/:id", async (req, res, next) => {
  console.log("/api/userRole PUT call", req.params.id);
  let roleCheck = false;
  if (req.user && req.user.userRoles) {
    req.user.userRoles.forEach((userRole) => {
      if (userRole.roleName == "SysAdmin" || userRole.roleName == "AppAdmin") {
        roleCheck = true;
      }
    });
  }
  if (!roleCheck) {
    return next({ error: new Error("Unauthorized!"), status: HttpStatus.BAD_REQUEST });
  }
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
    console.log("/UserRole DELETE call", req.params.id);
    let roleCheck = false;
    if (req.user && req.user.userRoles) {
      req.user.userRoles.forEach((userRole) => {
        if (userRole.roleName == "SysAdmin" || userRole.roleName == "AppAdmin") {
          roleCheck = true;
        }
      });
    }
    if (!roleCheck) {
      return next({ error: new Error("Unauthorized!"), status: HttpStatus.BAD_REQUEST });
    }
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

module.exports = router;

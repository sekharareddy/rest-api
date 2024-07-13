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
const { get } = require("../models-mssql/AdmittedChildren");

router.get("/", async (req, res, next) => {
  console.log("/AdmittedChildren GET call");
  try {
    if (req.query.tenantId && req.query.appId && req.query.orgId) {
      const data = await get(req.query.tenantId, req.query.appId, req.query.orgId, req.user);
      next(new QueryResult(data));
    } else {
      next({ error: "tenantId and/or appId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

module.exports = router;

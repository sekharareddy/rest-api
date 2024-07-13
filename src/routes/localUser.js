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
const { getUserByPasswordHash } = require("../models-mssql/AppUser");

router.get("/", async (req, res, next) => {
  console.log("/localUser GET call", req.query.tenantId);
  try {
    if (req.query.tenantId && req.query.appId) {
      const data = await getUserByPasswordHash(req.query.tenantId, req.query.appId, "local", req.query.email, req.query.password_hash);
      if (!data) {
        const error = new Error("Invalid credentials!");
        error.status = HttpStatus.UNAUTHORIZED;
        error.success = false;
        error.message2 = "Invalid credentials !";
        next(error);
      } else {
        next(new QueryResult(data));
      }
    } else {
      next({ error: "tenantId and appId can not be null!", status: HttpStatus.BAD_REQUEST });
    }
  } catch (err) {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

module.exports = router;

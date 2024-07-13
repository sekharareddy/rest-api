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
const { get, validate, create, update, del } = require("../models-mssql/ApplicationAYClassSectionsSubjectExamMarksReport");

router.get("/", async (req, res, next) => {
  console.log("/ApplicationAYClassSectionsSubjectExamMarks GET call");
  try {
    const data = await get(req.query, req.user);
    next(new QueryResult(data));
  } catch (err) {
    // err.status = HttpStatus.BAD_REQUEST;
    next({ error: err, status: HttpStatus.BAD_REQUEST });
  }
}, returnStateHandler);

module.exports = router;

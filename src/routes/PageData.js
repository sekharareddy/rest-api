// Express related backend imports
const express = require("express");

const router = express.Router();
const { query, validationResult } = require("express-validator");
const HttpStatus = require("../utils/http_codes.json");

// Logger
const logger = require("../utils/logger");

// Response Handler
const { returnStateHandler } = require("../utils/returnStateHandler");
const { QueryResult } = require("../utils/QueryResult");
const { ErrorResponse } = require("../utils/ErrorResponse");

const { TrhsError } = require("../utils/api_messages");
const { fnFindOne, fnFindOneById } = require("../models-mssql/PageData");
// Mod to tenant id and app id
// Validate with JOI schema
// Pass through Auth middleware
// Pass params to the get call

router.get(
  "/",
  query("tenantId").isString(),
  query("appId").isString(),
  query("pageName").isString(),
  async (req, res, next) => {
    try {
      validationResult(req).throw();
      const { appId } = req.query;
      const { tenantId } = req.query;
      const { pageName } = req.query;
      let publishStatus = "PUBLISHED";
      console.log(`req.query.publishStatus: ${req.query.publishStatus}`);
      if (req.query.publishStatus) {
        publishStatus = req.query.publishStatus;
      }
      console.log("**************Page ");
      if (appId === undefined) {
        const errResp = new ErrorResponse(
          400,
          TrhsError.ValidationError.MANDATORY_PARAM_MISSING,
          false,
          "Mandatory Param Missing",
        );
        return errResp;
      }
      // console.log("Querying..");
      const toRet = await fnFindOne(tenantId, appId, pageName, publishStatus);
      // console.log(toRet,"================================");
      next(new QueryResult(toRet));
    } catch (error) {
      console.log(error);
      next(new ErrorResponse(500, TrhsError.AppError.UNKNOWN_EXCEPTION, false, ""));
    }
  },
  returnStateHandler,
);

router.get(
  "/:id",
  query("tenantId").isString(),
  query("appId").isString(),
  async (req, res, next) => {
    try {
      validationResult(req).throw();
      const { appId } = req.query;
      const { tenantId } = req.query;
      const pageId = req.params.id;
      let publishStatus = "PUBLISHED";
      console.log(`req.query.publishStatus: ${req.query.publishStatus}`);
      if (req.query.publishStatus) {
        publishStatus = req.query.publishStatus;
      }
      console.log("**************Page ");
      if (appId === undefined) {
        const errResp = new ErrorResponse(
          400,
          TrhsError.ValidationError.MANDATORY_PARAM_MISSING,
          false,
          "Mandatory Param Missing",
        );
        return errResp;
      }
      // console.log("Querying..");
      const toRet = await fnFindOneById(tenantId, appId, pageId, publishStatus);
      // console.log(toRet,"================================");
      next(new QueryResult(toRet));
    } catch (error) {
      console.log(error);
      next(new ErrorResponse(500, TrhsError.AppError.UNKNOWN_EXCEPTION, false, ""));
    }
  },
  returnStateHandler,
);

module.exports = router;

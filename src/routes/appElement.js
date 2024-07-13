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
const {
  create,
  update,
  get,
  del,
  validate,
} = require("../models-mssql/AppElement");

router.get(
  "/",
  async (req, res, next) => {
    console.log("/appElement GET call", req.query.appId);
    try {
      if (req.query.appId) {
        const data = await get(req.query.appId);
        next(new QueryResult(data));
      } else {
        next({
          error: "appId can not be null!",
          status: HttpStatus.BAD_REQUEST,
        });
      }
    } catch (err) {
      // err.status = HttpStatus.BAD_REQUEST;
      next({ error: err, status: HttpStatus.BAD_REQUEST });
    }
  },
  returnStateHandler,
);

router.get(
  "/:id",
  async (req, res, next) => {
    console.log("/api/appElement GET call");
    try {
      const data = await get(req.params.id);
      next(new QueryResult(data));
    } catch (err) {
      // err.status = HttpStatus.BAD_REQUEST;
      next({ error: err, status: HttpStatus.BAD_REQUEST });
    }
  },
  returnStateHandler,
);

router.post(
  "/",
  async (req, res, next) => {
    console.log("/api/appElement POST call");
    await validate(req.body)
      .then(async (dataIn) => {
        dataIn = await create(dataIn);
        next(new QueryResult(dataIn));
      })
      .catch((err) => {
        // err.status = HttpStatus.BAD_REQUEST;
        next({ error: err, status: HttpStatus.BAD_REQUEST });
      });
  },
  returnStateHandler,
);

router.delete(
  "/:id",
  async (req, res, next) => {
    console.log("/api/appElemet DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

router.put(
  "/:id",
  async (req, res, next) => {
    console.log("/api/appElement PUT call", req.params.id);
    await validate(req.body, req.params.id)
      .then(async (dataIn) => {
        dataIn = await update(dataIn);
        next(new QueryResult(dataIn));
      })
      .catch((err) => {
        // err.status = HttpStatus.BAD_REQUEST;
        next({ error: err, status: HttpStatus.BAD_REQUEST });
      });
  },
  returnStateHandler,
);

module.exports = router;

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
  getById,
  validate,
} = require("../models-mssql/Page");

router.get(
  "/",
  async (req, res, next) => {
    console.log("/page GET call", req.query.appId);
    try {
      if (req.query.appId) {
        const data = await get(req.query);
        next(new QueryResult(data));
      } else {
        next({
          error: "appId can not be null",
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
    console.log("/page GET call", req.params.id);
    try {
      if (req.params.id) {
        const data = await getById(req.params.id);
        next(new QueryResult(data));
      } else {
        next({ error: err, status: HttpStatus.BAD_REQUEST });
      }
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
    console.log("/page POST call", req.query);
    const datas = req.body;
    if (datas.apiEndPointSchema === "") {
      datas.apiEndPointSchema = null;
    }
    await validate(datas, req.query)
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

router.put(
  "/:id",
  async (req, res, next) => {
    console.log("/page PUT call", req.params.id, req.query);
    await validate(req.body, req.query, req.params.id)
      .then(async (dataIn) => {
        // console.log(JSON.stringify(dataIn));
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

router.delete(
  "/:id",
  async (req, res, next) => {
    console.log("/page DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

module.exports = router;

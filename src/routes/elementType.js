// Express related backend imports
const express = require("express");

const router = express.Router();
const HttpStatus = require("../utils/http_codes.json");

// Logger
// const logger = require("../utils/logger");

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
  getById,
} = require("../models-mssql/ElementTypes");

router.post(
  "/",
  async (req, res, next) => {
    console.log("/api/elementTypes POST call");
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

router.put(
  "/:id",
  async (req, res, next) => {
    console.log("/api/elementTypes PUT call", req.params.id);
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

router.delete(
  "/:id",
  async (req, res, next) => {
    console.log("/api/elementTypes DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

router.get(
  "/",
  async (req, res, next) => {
    console.log("/api/elementTypes GET call");
    let data;
    if (req.query.defaultParentLevel) {
      data = await get(req.query.defaultParentLevel);
    } else {
      data = await get();
    }
    next(new QueryResult(data));
  },
  returnStateHandler,
);

router.get(
  "/:id",
  async (req, res, next) => {
    console.log("/api/ElementType GET/{id} call");
    try {
      const data = await getById(req.params.id);
      next(new QueryResult(data));
    } catch (err) {
      // err.status = HttpStatus.BAD_REQUEST;
      next({ error: err, status: HttpStatus.BAD_REQUEST });
    }
  },
  returnStateHandler,
);

module.exports = router;

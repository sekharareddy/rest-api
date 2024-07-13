// Express related backend imports
const express = require("express");

const router = express.Router();
const HttpStatus = require("../utils/http_codes.json");

// Logger
const logger = require("../utils/logger")(module);

// Response Handler
const { QueryResult } = require("../utils/QueryResult");
const { returnStateHandler } = require("../utils/returnStateHandler");

// Entity model methods
const {
  get,
  getById,
  validate,
  create,
  update,
  del,
} = require("../services/academicYears.service");

router.get(
  "/",
  async (req, res, next) => {
    logger.info("/AcademicYears GET call");
    try {
      const data = await get(req.query, req.user);
      next(new QueryResult(data));
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
    logger.info("/AcademicYears GET call");
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

router.post(
  "/",
  async (req, res, next) => {
    logger.info("/AcademicYears POST call");
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
    logger.info("/AcademicYears DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

router.put(
  "/:id",
  async (req, res, next) => {
    logger.info("/AcademicYears PUT call", req.params.id);
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

router.patch(
  "/:id",
  async (req, res, next) => {
    logger.info("/AcademicYears PUT call", req.params.id);
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

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     tokenSource:
 *       type: apiKey
 *       in: header
 *       name: tokenSource
 *
 *   schemas:
 *     AcademicYears:
 *       type: object
 *       properties:
 *         academicYearId:
 *           type: string
 *           format: uuid
 *           description: The auto-generated ID of the academic year.
 *         academicYearName:
 *           type: string
 *           description: Name of the academic year.
 *         academicYearStartDate:
 *           type: string
 *           format: date
 *           description: Start date of the academic year.
 *         academicYearEndDate:
 *           type: string
 *           format: date
 *           description: End date of the academic year.
 *         createdDateTime:
 *           type: string
 *           format: date-time
 *           description: Date and time when the academic year was created.
 *         lastUpdatedDateTime:
 *           type: string
 *           format: date-time
 *           description: Date and time when the academic year was last updated.
 *         orgId:
 *           type: string
 *           description: Organization ID associated with the academic year.
 *         tenantId:
 *           type: string
 *           description: Tenant ID associated with the academic year.
 *         appId:
 *           type: string
 *           description: Application ID associated with the academic year.
 *       example:
 *         academicYearId: ayId
 *         academicYearName: Academic Year Name
 *         academicYearStartDate: 2000-01-01
 *         academicYearEndDate: 2001-01-01
 *         createdDateTime: 2000-01-01T00:00:00Z
 *         lastUpdatedDateTime: 2000-01-01T00:00:00Z
 *         orgId: organisationId
 *         tenantId: tenantId123
 *         appId: applicationId123
 *
 * security:
 *   - BearerAuth: []
 *   - tokenSource: []
 *
 * /AcademicYears:
 *   get:
 *     summary: Retrieve a list of academic years.
 *     tags:
 *       - AcademicYears
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID to filter academic years by.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID to filter academic years by.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID to filter academic years by.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of records per page.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: search by name.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by attribute.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *         description: sort order ASC/DESC.
 *     responses:
 *       '200':
 *         description: A list of academic years.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicYears'
 *
 *   post:
 *     summary: Create a new academic year.
 *     tags:
 *       - AcademicYears
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID to filter academic years by.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID to filter academic years by.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID to filter academic years by.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicYears'
 *     responses:
 *       '201':
 *         description: Academic year created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYears'
 *
 * /AcademicYears/{id}:
 *   get:
 *     summary: Retrieve an academic year by ID.
 *     tags:
 *       - AcademicYears
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID to filter academic years by.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID to filter academic years by.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID to filter academic years by.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the academic year to retrieve.
 *     responses:
 *       '200':
 *         description: Academic year found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYears'
 *
 *   put:
 *     summary: Update an academic year by ID.
 *     tags:
 *       - AcademicYears
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID to filter academic years by.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID to filter academic years by.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID to filter academic years by.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the academic year to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicYears'
 *     responses:
 *       '200':
 *         description: Academic year updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYears'
 *
 *   delete:
 *     summary: Delete an academic year by ID.
 *     tags:
 *       - AcademicYears
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID to filter academic years by.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID to filter academic years by.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID to filter academic years by.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the academic year to delete.
 *     responses:
 *       '200':
 *         description: Academic year deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '404':
 *         description: Academic year not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

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
} = require("../services/academicYearHoliday.service");

router.get(
  "/",
  async (req, res, next) => {
    logger.info("/AcademicYearHoliday GET call");
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
    logger.info("/AcademicYearHoliday GET call");
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
    logger.info("/AcademicYearHoliday POST call");
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
    logger.info("/AcademicYearHoliday DELETE call", req.params.id);
    const data = await del(req.params.id);
    next(new QueryResult(data));
  },
  returnStateHandler,
);

router.put(
  "/:id",
  async (req, res, next) => {
    logger.info("/AcademicYearHoliday PUT call", req.params.id);
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
    logger.info("/AcademicYearHoliday PUT call", req.params.id);
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
 *     AcademicYearHoliday:
 *       type: object
 *       properties:
 *         academicYearHolidayId:
 *           type: string
 *           format: uuid
 *           description: The auto-generated ID of the academic year holiday.
 *         tenantId:
 *           type: string
 *           description: Tenant ID associated with the academic year holiday.
 *         appId:
 *           type: string
 *           description: Application ID associated with the academic year holiday.
 *         orgId:
 *           type: string
 *           format: uuid
 *           description: Organization ID associated with the academic year holiday.
 *         academicYearId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated academic year.
 *         academicYearHolidayName:
 *           type: string
 *           description: Name of the academic year holiday.
 *         academicYearHolidayType:
 *           type: integer
 *           description: Type of the academic year holiday.
 *         academicYearHolidayDate:
 *           type: string
 *           format: date
 *           description: Date of the academic year holiday.
 *         createdDateTime:
 *           type: string
 *           format: date-time
 *           description: Date and time when the academic year holiday was created.
 *         lastUpdatedDateTime:
 *           type: string
 *           format: date-time
 *           description: Date and time when the academic year holiday was last updated.
 *       example:
 *         academicYearHolidayId: ayhId
 *         tenantId: tenantId123
 *         appId: applicationId123
 *         orgId: organisationId
 *         academicYearId: ayId
 *         academicYearHolidayName: Christmas Holiday
 *         academicYearHolidayType: 1
 *         academicYearHolidayDate: 2023-12-25
 *         createdDateTime: 2023-01-01T00:00:00Z
 *         lastUpdatedDateTime: 2023-01-01T00:00:00Z
 *
 * security:
 *   - BearerAuth: []
 *   - tokenSource: []
 *
 * /AcademicYearHolidays:
 *   get:
 *     summary: Retrieve a list of academic year holidays.
 *     tags:
 *       - AcademicYearHoliday
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID to filter academic year holidays by.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID to filter academic year holidays by.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID to filter academic year holidays by.
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
 *         description: Search term for filtering by holiday name.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Attribute to sort by (e.g.,name, date attributes).
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order (ascending or descending).
 *     responses:
 *       '200':
 *         description: A list of academic year holidays.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicYearHoliday'
 *       '400':
 *         description: Bad request. Invalid parameters.
 *       '500':
 *         description: Internal server error.
 *
 *   post:
 *     summary: Create a new academic year holiday.
 *     tags:
 *       - AcademicYearHoliday
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID associated with the new academic year holiday.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID associated with the new academic year holiday.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID associated with the new academic year holiday.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicYearHoliday'
 *     responses:
 *       '201':
 *         description: Academic year holiday created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearHoliday'
 *       '400':
 *         description: Bad request. Invalid input data.
 *       '500':
 *         description: Internal server error.
 *
 * /AcademicYearHolidays/{id}:
 *   get:
 *     summary: Retrieve an academic year holiday by ID.
 *     tags:
 *       - AcademicYearHoliday
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the academic year holiday to retrieve.
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID associated with the academic year holiday.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID associated with the academic year holiday.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID associated with the academic year holiday.
 *     responses:
 *       '200':
 *         description: Academic year holiday found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearHoliday'
 *       '404':
 *         description: Academic year holiday not found.
 *       '500':
 *         description: Internal server error.
 *
 *   put:
 *     summary: Update an academic year holiday by ID.
 *     tags:
 *       - AcademicYearHoliday
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the academic year holiday to update.
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID associated with the academic year holiday.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID associated with the academic year holiday.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID associated with the academic year holiday.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicYearHoliday'
 *     responses:
 *       '200':
 *         description: Academic year holiday updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearHoliday'
 *       '400':
 *         description: Bad request. Invalid input data.
 *       '404':
 *         description: Academic year holiday not found.
 *       '500':
 *         description: Internal server error.
 *
 *   patch:
 *     summary: Partially update an academic year holiday by ID.
 *     tags:
 *       - AcademicYearHoliday
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the academic year holiday to partially update.
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID associated with the academic year holiday.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID associated with the academic year holiday.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID associated with the academic year holiday.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicYearHoliday'
 *     responses:
 *       '200':
 *         description: Academic year holiday partially updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearHoliday'
 *       '400':
 *         description: Bad request. Invalid input data.
 *       '404':
 *         description: Academic year holiday not found.
 *       '500':
 *         description: Internal server error.
 *
 *   delete:
 *     summary: Delete an academic year holiday by ID.
 *     tags:
 *       - AcademicYearHoliday
 *     security:
 *       - BearerAuth: []
 *       - tokenSource: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the academic year holiday to delete.
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID associated with the academic year holiday.
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID associated with the academic year holiday.
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID associated with the academic year holiday.
 *     responses:
 *       '200':
 *         description: Academic year holiday deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '404':
 *         description: Academic year holiday not found.
 *       '500':
 *         description: Internal server error.
 */

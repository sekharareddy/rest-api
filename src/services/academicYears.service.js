const Joi = require("joi");
const Sequelize = require("sequelize");
const { AcademicYears } = require("../models-mssql/AcademicYears");
const { AcademicYearHoliday } = require("../models-mssql/AcademicYearHoliday");
const {
  cacheData,
  getCachedData,
  invalidateCache,
  invalidateCacheByPattern,
} = require("../utils/redis");
const logger = require("../utils/logger")(module);

const joiSchema = Joi.object().keys({
  academicYearId: Joi.string(),
  academicYearName: Joi.string().required(),
  academicYearStartDate: Joi.date().required(),
  academicYearEndDate: Joi.date().required(),
  lastUpdatedDateTime: Joi.date(),
  orgId: Joi.string().required(),
  tenantId: Joi.string().required(),
  appId: Joi.string().required(),
});

// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

const create = async (obj) => {
  try {
    logger.info("Creating new academic year");
    const data = AcademicYears.build(obj);
    await data.save();
    await cacheData(`AcademicYears/${data.academicYearId}`, data);
    await invalidateCacheByPattern("AcademicYears/all/*"); // invalidates the cache by key-pattern.
    return data;
  } catch (error) {
    logger.error("Error creating academic year:", error);
    throw error;
  }
};

const getById = async (id, cache = true) => {
  try {
    const key = `AcademicYears/${id}`;
    if (cache) {
      const cachedData = await getCachedData(key);
      if (cachedData) {
        return AcademicYears.build(cachedData, { isNewRecord: false });
      }
    }
    const data = await AcademicYears.findByPk(id);
    if (!data) {
      throw new Error("Academic year not found");
    }
    await cacheData(key, data);
    return data;
  } catch (error) {
    logger.error("Error getting academic year by ID:", error);
    throw error;
  }
};

const update = async (dataIn) => {
  try {
    const key = `AcademicYears/${dataIn.academicYearId}`;
    const data = await getById(dataIn.academicYearId, false);
    data.academicYearName = dataIn.academicYearName || data.academicYearName;
    data.academicYearStartDate = dataIn.academicYearStartDate || data.academicYearStartDate;
    data.academicYearEndDate = dataIn.academicYearEndDate || data.academicYearEndDate;
    data.orgId = dataIn.orgId || data.orgId;

    await data.save();
    await invalidateCache(key);
    await invalidateCacheByPattern("AcademicYears/all/*"); // invalidates the cache by key-pattern.
    await cacheData(key, data);
    return data;
  } catch (error) {
    logger.error("Error updating academic year:", error);
    throw error;
  }
};

const del = async (id) => {
  try {
    const data = await getById(id, false);
    await data.destroy();
    await invalidateCache(`AcademicYears/${id}`);
    await invalidateCacheByPattern("AcademicYears/all/*"); // invalidates the cache by key-pattern.
    return true;
  } catch (error) {
    logger.error("Error deleting academic year:", error);
    throw error;
  }
};

const get = async (query, user, fromCache = true) => {
  try {
    let userHasStaffRole = false;
    user.userRoles.forEach((role) => {
      if (
        (role.roleName === "Staff" || role.roleName === "Support Staff")
        && role.roleId === query.roleId
      ) {
        userHasStaffRole = true;
      }
    });
    logger.info(`userHasStaffRole: ${userHasStaffRole}`);

    let {
      tenantId,
      appId,
      orgId,
      page = 1,
      limit = 10,
      search = "",
      filters = {},
      sortBy = "createdDateTime", // Default value for sortBy and sortOrder.
      sortOrder = "ASC",
    } = query;

    // Convert page and limit to integers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const offset = (page - 1) * limit;
    const key = `AcademicYears/all/${tenantId}/${appId}/${orgId}/${page}/${limit}/${search}/${JSON.stringify(
      filters,
    )}/${sortBy}/${sortOrder}`;

    // Check cache first if requested
    if (fromCache) {
      const cachedData = await getCachedData(key);
      if (cachedData) {
        return cachedData;
      }
    }

    const whereClause = {
      tenantId,
      appId,
      orgId,
      ...(search && {
        academicYearName: {
          [Sequelize.Op.like]: `%${search}%`,
        },
      }),
      ...filters,
    };

    const { count, rows } = await AcademicYears.findAndCountAll({
      where: whereClause,
      include: [{ model: AcademicYearHoliday, as: "academicYearHolidays" }],
      offset,
      limit,
      order: [[sortBy, sortOrder]],
    });

    const result = {
      totalRecords: count,
      currentPage: page,
      data: rows,
    };

    // Cache the result if there are records found
    if (count > 0) {
      await cacheData(key, result);
    }

    return result;
  } catch (error) {
    logger.error("Error getting academic years:", error);
    throw error;
  }
};

const validate = async (data, id = null) => {
  const dataIn = data;
  try {
    if (id !== null) {
      dataIn.academicYearId = id;
    }
    const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
    if (error) {
      throw new Error(
        `Validation error: ${error.details.map((x) => x.message).join(", ")}`,
      );
    }
    return value;
  } catch (error) {
    logger.error("Validation error:", error);
    return error.message;
  }
};

module.exports = {
  create,
  getById,
  get,
  del,
  update,
  validate,
};

const Joi = require("joi");
const Sequelize = require("sequelize");
const { AcademicYearHoliday } = require("../models-mssql/AcademicYearHoliday");
const {
  cacheData,
  getCachedData,
  invalidateCache,
  invalidateCacheByPattern,
} = require("../utils/redis");
const logger = require("../utils/logger")(module);

const joiSchema = Joi.object().keys({
  academicYearHolidayId: Joi.string(),
  tenantId: Joi.string().required(),
  appId: Joi.string().required(),
  orgId: Joi.string().required(),
  academicYearId: Joi.string().required(),
  academicYearHolidayName: Joi.string(),
  academicYearHolidayType: Joi.number().required(),
  academicYearHolidayDate: Joi.date(),
  academicYearHolidayFromDate: Joi.date(),
  academicYearHolidayToDate: Joi.date(),
  weekDay: Joi.string().allow(null, ""),
  lastUpdatedDateTime: Joi.date(),
});

const JOIvalidationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

const create = async (dataIn) => {
  try {
    logger.info("Creating new Academic Year Holiday");
    if (
      dataIn.academicYearHolidayFromDate
      && dataIn.academicYearHolidayToDate
    ) {
      let strQuery = `exec dbo.addAcademicYearHolidays :tenantId, :appId, :orgId, 
              :academicYearId, :academicYearHolidayName, :academicYearHolidayType, 
              :academicYearHolidayFromDate, :academicYearHolidayToDate`;
      const objReplacements = {
        tenantId: dataIn.tenantId,
        appId: dataIn.appId,
        orgId: dataIn.orgId,
        academicYearId: dataIn.academicYearId,
        academicYearHolidayName: dataIn.academicYearHolidayName,
        academicYearHolidayType: dataIn.academicYearHolidayType,
        academicYearHolidayFromDate: dataIn.academicYearHolidayFromDate,
        academicYearHolidayToDate: dataIn.academicYearHolidayToDate,
      };
      if (
        dataIn.weekDay
        && dataIn.weekDay !== "null"
        && dataIn.weekDay !== ""
      ) {
        strQuery += ", :weekDay";
        objReplacements.weekDay = dataIn.weekDay;
      }

      const result = await Sequelize.query(strQuery, {
        replacements: objReplacements,
      });
      await invalidateCacheByPattern("AcademicYearHoliday/all/*");
      return result;
    }
    const data = AcademicYearHoliday.build(dataIn);
    await data.save();
    await cacheData(`AcademicYearHoliday/${data.academicYearHolidayId}`, data);
    await invalidateCacheByPattern("AcademicYearHoliday/all/*");
    return data;
  } catch (error) {
    logger.error("Error creating academic year holiday:", error);
    throw error;
  }
};

const getById = async (id, cache = true) => {
  try {
    const key = `AcademicYearHoliday/${id}`;
    if (cache) {
      const cachedData = await getCachedData(key);
      if (cachedData) {
        return AcademicYearHoliday.build(cachedData, { isNewRecord: false });
      }
    }
    const data = await AcademicYearHoliday.findByPk(id);
    if (!data) {
      throw new Error("Academic year holiday not found");
    }
    await cacheData(key, data);
    return data;
  } catch (error) {
    logger.error("Error getting academic year holiday by ID:", error);
    throw error;
  }
};

const update = async (dataIn) => {
  try {
    const key = `AcademicYearHoliday/${dataIn.academicYearHolidayId}`;
    const data = await getById(dataIn.academicYearHolidayId, false);

    data.academicYearId = dataIn.academicYearId || data.academicYearId;
    data.academicYearHolidayName = dataIn.academicYearHolidayName || data.academicYearHolidayName;
    data.academicYearHolidayType = dataIn.academicYearHolidayType || data.academicYearHolidayType;
    data.academicYearHolidayDate = dataIn.academicYearHolidayDate || data.academicYearHolidayDate;

    await data.save();
    await invalidateCache(key);
    await invalidateCacheByPattern("AcademicYearHoliday/all/*");
    await cacheData(key, data);
    return data;
  } catch (error) {
    logger.error("Error updating academic year holiday:", error);
    throw error;
  }
};

const del = async (id) => {
  try {
    const result = await AcademicYearHoliday.destroy({
      where: { academicYearHolidayId: id },
    });
    await invalidateCache(`AcademicYearHoliday/${id}`);
    await invalidateCacheByPattern("AcademicYearHoliday/all/*");
    return result;
  } catch (error) {
    logger.error("Error deleting academic year holiday:", error);
    throw error;
  }
};

const get = async (query, user, fromCache = true) => {
  try {
    let userHasStaffRole = false;
    user.userRoles.forEach((role) => {
      if (
        (role.roleName === "AppAdmin" || role.roleName === "Support Staff")
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
      sortBy = "academicYearHolidayDate",
      sortOrder = "ASC",
    } = query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const offset = (page - 1) * limit;
    const key = `AcademicYearHoliday/all/${tenantId}/${appId}/${orgId}/${page}/${limit}/${search}/${JSON.stringify(
      filters,
    )}/${sortBy}/${sortOrder}`;

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
        [Sequelize.Op.or]: [
          { academicYearHolidayName: { [Sequelize.Op.like]: `%${search}%` } },
          { academicYearHolidayType: { [Sequelize.Op.like]: `%${search}%` } },
        ],
      }),
      ...filters,
    };

    const { count, rows } = await AcademicYearHoliday.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order: [[sortBy, sortOrder]],
    });

    const result = {
      totalRecords: count,
      currentPage: page,
      data: rows,
    };

    if (count > 0) {
      await cacheData(key, result);
    }

    return result;
  } catch (error) {
    logger.error("Error getting academic year holidays:", error);
    throw error;
  }
};

const validate = async (data, id = null) => {
  const dataIn = data;
  try {
    if (id !== null) {
      dataIn.academicYearHolidayId = id;
    }
    if (Object.hasOwn(dataIn, "weekDay") && dataIn.weekDay === null) {
      dataIn.weekDay = "null";
    }

    if (Object.hasOwn(dataIn, "weekDay") && dataIn.weekDay === "") {
      dataIn.weekDay = "null";
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
    throw error;
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

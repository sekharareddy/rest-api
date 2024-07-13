const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class AcademicYearHoliday extends Model {}

AcademicYearHoliday.init(
  {
    academicYearHolidayId: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orgId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    academicYearId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    academicYearHolidayName: {
      type: DataTypes.STRING,
    },
    academicYearHolidayType: {
      type: DataTypes.NUMBER,
    },
    academicYearHolidayDate: {
      type: DataTypes.DATE,
    },
    createdDateTime: {
      type: DataTypes.DATE,
    },
    lastUpdatedDateTime: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "AcademicYearHoliday",
    tableName: "AcademicYearHolidays",
    schema: "dbo",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  },
);

const joiSchema = JOI.object().keys({
  academicYearHolidayId: JOI.string(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  orgId: JOI.string().required(),
  academicYearId: JOI.string().required(),
  academicYearHolidayName: JOI.string(),
  academicYearHolidayType: JOI.string().required(),
  academicYearHolidayDate: JOI.date(),
  academicYearHolidayFromDate: JOI.date(),
  academicYearHolidayToDate: JOI.date(),
  weekDay: JOI.string().allow(null).allow(""),
  lastUpdatedDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (dataIn) => {
  console.log("Creating new Academic year Holidays");
  if (
    dataIn.hasOwnProperty("academicYearHolidayFromDate")
    && dataIn.hasOwnProperty("academicYearHolidayToDate")
  ) {
    console.log(dataIn.weekDay);
    let strQuery = "exec dbo.addAcademicYearHolidays :tenantId, :appId, :orgId, \
              :academicYearId, :academicYearHolidayName, :academicYearHolidayType, \
              :academicYearHolidayFromDate, :academicYearHolidayToDate";
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
    if (dataIn.weekDay && dataIn.weekDay != "null" && dataIn.weekDay != "") {
      strQuery = `${strQuery}, :weekDay `;
      objReplacements.weekDay = dataIn.weekDay;
    }

    await sequelize
      .query(strQuery, { replacements: objReplacements })
      .then((v) => {
        console.log(v);
      })
      .catch((err) => {
        console.error(102, err);
        throw err;
      });
  } else {
    const data = AcademicYearHoliday.build(dataIn);
    return await data.save();
  }
};

const getById = async (id) => await AcademicYearHoliday.findByPk(id);
const update = async (dataIn) => {
  console.log("AcademicYearHoliday Update: ", dataIn);
  const data = await getById(dataIn.academicYearHolidayId);
  if (!data) {
    throw new Error("Invalid academicYearHolidayId!");
  }

  // only appName is allowed to be changed, academicYearHolidayId is not allowed to change as per business rules
  data.academicYearId = dataIn.academicYearId
    ? dataIn.academicYearId
    : data.academicYearId;
  data.academicYearHolidayName = dataIn.academicYearHolidayName
    ? dataIn.academicYearHolidayName
    : data.academicYearHolidayName;
  data.academicYearHolidayType = dataIn.academicYearHolidayType
    ? dataIn.academicYearHolidayType
    : data.academicYearHolidayType;
  data.academicYearHolidayDate = dataIn.academicYearHolidayDate
    ? dataIn.academicYearHolidayDate
    : data.academicYearHolidayDate;
  return await data.save();
};
const del = async (id) => await AcademicYearHoliday.destroy({ where: { academicYearHolidayId: id } });

const get = async (qry, user) => {
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if (
      (role.roleName == "AppAdmin" || role.roleName == "Support Staff")
      && role.roleId == qry.roleId
    ) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = {
    tenantId: qry.tenantId,
    appId: qry.appId,
    orgId: qry.orgId,
  };

  return await AcademicYearHoliday.findAll({ where: whereClause });
};
const validate = async (dataIn, id = null) => {
  if (id != null) {
    dataIn.academicYearHolidayId = id;
    const data = await getById(dataIn.academicYearHolidayId);
    if (!data) {
      throw new Error("Invalid academicYearHolidayId!");
    }
  }
  if (dataIn.hasOwnProperty("weekDay") && dataIn.weekDay == "") {
    dataIn.weekDay = "null";
  }
  if (dataIn.hasOwnProperty("weekDay") && dataIn.weekDay == null) {
    dataIn.weekDay = "null";
  }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
  } else {
    // validate foreign keys and any other business requiremets
    return value;
    // return generate(value);
  }
};

module.exports = {
  AcademicYearHoliday,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

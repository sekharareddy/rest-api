const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

const { AcademicYearHoliday } = require("./AcademicYearHoliday");

class AcademicYears extends Model {
}

AcademicYears.init({
  academicYearId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  academicYearName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academicYearStartDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  academicYearEndDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdDateTime: {
    type: DataTypes.DATE,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
  },
  orgId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  appId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: "AcademicYears",
  tableName: "academicYears",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  academicYearId: JOI.string(),
  academicYearName: JOI.string(),
  academicYearStartDate: JOI.date().required(),
  academicYearEndDate: JOI.date().required(),
  lastUpdatedDateTime: JOI.date(),
  orgId: JOI.string().required(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
});

AcademicYears.hasMany(AcademicYearHoliday, {
  foreignKey: "academicYearId",
  as: "academicYearHolidays",
});

// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (obj) => {
  console.log("Creating new academicYear");
  const o = AcademicYears.build(obj);
  return await o.save();
};

const getById = async (id) => await AcademicYears.findByPk(id);
const update = async (dataIn) => {
  console.log("Academic Year Update: ", dataIn);
  const data = await getById(dataIn.academicYearId);
  // only appName is allowed to be changed, academicYearId is not allowed to change as per business rules
  data.academicYearId = dataIn.academicYearId ? dataIn.academicYearId : data.academicYearId;
  data.academicYearName = dataIn.academicYearName ? dataIn.academicYearName : data.academicYearName;
  data.academicYearStartDate = dataIn.academicYearStartDate ? dataIn.academicYearStartDate : data.academicYearStartDate;
  data.academicYearEndDate = dataIn.academicYearEndDate ? dataIn.academicYearEndDate : data.academicYearEndDate;
  return await data.save();
};
const del = async (id) => await AcademicYears.destroy({ where: { academicYearId: id } });

const get = async (qry, user) => {
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Staff" || role.roleName == "Support Staff")
            && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId };
  return await AcademicYears.findAll({
    where: whereClause,
    include: [
      { model: AcademicYearHoliday, as: "academicYearHolidays" },
    ],
  });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.academicYearId = id; }

  console.log(dataIn);
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
  AcademicYears,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

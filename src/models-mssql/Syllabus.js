const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const { AppElement } = require('./AppElement');

class Syllabus extends Model {
}

Syllabus.init({
  syllabusId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  syllabusName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  syllabusShortName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  syllabusProvider: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  syllabusPublishDate: {
    type: DataTypes.DATE,
  },
  syllabusStartDate: {
    type: DataTypes.DATE,
  },
  syllabusEndDate: {
    type: DataTypes.DATE,
  },
  syllabusExtendedEndDate: {
    type: DataTypes.DATE,
  },
  createdBy: {
    type: DataTypes.UUID,
  },
  lastModifiedBy: {
    type: DataTypes.UUID,
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
  modelName: "Syllabus",
  tableName: "Syllabus",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  syllabusId: JOI.string(),
  syllabusName: JOI.string().required(),
  syllabusShortName: JOI.string().required(),
  syllabusProvider: JOI.string().required(),
  syllabusPublishDate: JOI.date(),
  syllabusStartDate: JOI.date().allow(null),
  syllabusEndDate: JOI.date().allow(null),
  syllabusExtendedEndDate: JOI.date().allow(null),
  lastUpdatedDateTime: JOI.date(),
  orgId: JOI.string().required(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

// Syllabus.hasMany(App,{
//   foreignKey:'syllabusId',
//   as:'rowFormData'
// });

const create = async (obj) => {
  console.log("Creating new syllabus");
  const o = Syllabus.build(obj);
  return await o.save();
};

const getById = async (id) => await Syllabus.findByPk(id);
const update = async (dataIn) => {
  console.log("Syllabus Update", dataIn);
  const data = await getById(dataIn.syllabusId);
  // only appName is allowed to be changed, syllabusId is not allowed to change as per business rules
  data.syllabusName = dataIn.syllabusName ? dataIn.syllabusName : data.syllabusName;
  data.syllabusShortName = dataIn.syllabusShortName ? dataIn.syllabusShortName : data.syllabusShortName;
  data.syllabusProvider = dataIn.syllabusProvider ? dataIn.syllabusProvider : data.syllabusProvider;
  data.syllabusPublishDate = dataIn.syllabusPublishDate ? dataIn.syllabusPublishDate : data.syllabusPublishDate;
  data.syllabusStartDate = dataIn.syllabusStartDate ? dataIn.syllabusStartDate : data.syllabusStartDate;
  data.syllabusEndDate = dataIn.syllabusEndDate ? dataIn.syllabusEndDate : data.syllabusEndDate;
  data.syllabusExtendedEndDate = dataIn.syllabusExtendedEndDate ? dataIn.syllabusExtendedEndDate : data.syllabusExtendedEndDate;
  return await data.save();
};
const del = async (id) => await Syllabus.destroy({ where: { syllabusId: id } });

const get = async (id, qry, user) => {
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Staff" || role.roleName == "Support Staff")
            && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId };

  return await Syllabus.findAll({ where: whereClause });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.syllabusId = id; }

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
  Syllabus,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const { AppElement } = require('./AppElement');

class TeachingMedium extends Model {
}

TeachingMedium.init({
  teachingMediumId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  teachingMediumLanguage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teachingMediumLanguageCode1: {
    type: DataTypes.STRING,
  },
  teachingMediumLanguageCode2: {
    type: DataTypes.STRING,
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
  modelName: "TeachingMedium",
  tableName: "teachingMediums",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  teachingMediumId: JOI.string(),
  teachingMediumLanguage: JOI.string().required(),
  teachingMediumLanguageCode1: JOI.string().allow(null).allow(""),
  teachingMediumLanguageCode2: JOI.string().allow(null).allow(""),
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

const create = async (obj) => {
  console.log("Creating new teachingMedium");
  const o = TeachingMedium.build(obj);
  return await o.save();
};

const getById = async (id) => await TeachingMedium.findByPk(id);
const update = async (dataIn) => {
  console.log("TeachingMedium Update: ", dataIn);
  const data = await getById(dataIn.teachingMediumId);
  // only appName is allowed to be changed, teachingMediumId is not allowed to change as per business rules
  data.teachingMediumLanguage = dataIn.teachingMediumLanguage ? dataIn.teachingMediumLanguage : data.teachingMediumLanguage;
  data.teachingMediumLanguageCode1 = dataIn.teachingMediumLanguageCode1 ? dataIn.teachingMediumLanguageCode1 : data.teachingMediumLanguageCode1;
  data.teachingMediumLanguageCode2 = dataIn.teachingMediumLanguageCode2 ? dataIn.teachingMediumLanguageCode2 : data.teachingMediumLanguageCode2;
  return await data.save();
};
const del = async (id) => await TeachingMedium.destroy({ where: { teachingMediumId: id } });

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

  return await TeachingMedium.findAll({ where: whereClause });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.teachingMediumId = id; }

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
  TeachingMedium,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

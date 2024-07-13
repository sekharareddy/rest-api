const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { Role } = require("./Role");

class OrganizationLicense extends Model {}
OrganizationLicense.init({
  orgLicenseId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  orgId: {
    type: DataTypes.UUID,
  },
  orgLicenseeUserId: {
    type: DataTypes.UUID,
  },
  orgLicenseType: {
    type: DataTypes.STRING,
  },
  orgLicenseStartDate: {
    type: DataTypes.DATE,
  },
  orgLicenseEndDate: {
    type: DataTypes.DATE,
  },
  orgLicenseActive: {
    type: DataTypes.BOOLEAN,
  },
  lastUpdatedDateTime: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: "OrganizationLicense",
  tableName: "organizationLicenses",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  orgLicenseId: JOI.string(),
  orgId: JOI.string().required(),
  orgLicenseeUserId: JOI.string(),
  orgLicenseType: JOI.string(),
  orgLicenseStartDate: JOI.date(),
  orgLicenseEndDate: JOI.date(),
  orgLicenseActive: JOI.boolean(),
  lastUpdateDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (dataIn) => {
  let modelData;
  modelData = OrganizationLicense.build(dataIn);
  return modelData.save();
};

const get = async (orgId) => OrganizationLicense.findAll({ where: {
  orgId,
} });
const getById = async (id) => OrganizationLicense.findByPk(id);

const del = async (id) => {
  const role = await OrganizationLicense.findByPk(id);
  await role.destroy();
};

const update = async (dataIn) => {
  const data = await getById(dataIn.orgLicenseId);
  // only sendUserMessageEmail is allowed to be changed as per business rules
  data.orgLicenseType = dataIn.orgLicenseType ? dataIn.orgLicenseType : data.orgLicenseType;
  return data.save();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.orgLicenseId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    return value;
  }
};

module.exports = {
  OrganizationLicense,
  create,
  get,
  getById,
  validate,
  del,
  update,
};

const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { OrganizationLicense } = require("./OrganizationLicense");
const logger = require("../utils/logger")(module);
const appGetById = require("./App").getById;

class Organization extends Model { }
Organization.init({
  orgId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  orgName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  orgStreetAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orgCity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orgState: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orgZipCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orgCellphone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orgHomephone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orgAltPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orgEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orgHeader: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tenantId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  appId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: "Organization",
  tableName: "organizations",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  orgId: JOI.string(),
  orgName: JOI.string(),
  orgStreetAddress: JOI.string(),
  orgCity: JOI.string(),
  orgState: JOI.string(),
  orgZipCode: JOI.string(),
  orgCellphone: JOI.string(),
  orgHomephone: JOI.string(),
  orgAltPhone: JOI.string(),
  orgEmail: JOI.string(),
  orgHeader: JOI.string(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  lastUpdateDateTime: JOI.date(),
  rowFormData: JOI.array(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: false, // remove unknown keys from the validated data
};

Organization.hasMany(OrganizationLicense, {
  foreignKey: "orgId",
  as: "rowFormData",
});

const getById = async (tenantId, appId, id) => Organization.findOne({
  where: {
    tenantId,
    appId,
    orgId: id,
  },
});

const create = async (dataIn) => {
  const modelData = Organization.build(dataIn);
  await modelData.save();
  return await getById(modelData.tenantId, modelData.appId, modelData.orgId);
};

const update = async (dataIn) => {
  const data = await getById(dataIn.tenantId, dataIn.appId, dataIn.orgId);
  // only appName is allowed to be changed, tenantId is not allowed to change as per business rules
  data.orgName = dataIn.orgName ? dataIn.orgName : data.orgName;
  data.orgStreetAddress = dataIn.orgStreetAddress ? dataIn.orgStreetAddress : data.orgStreetAddress;
  data.orgCity = dataIn.orgCity ? dataIn.orgCity : data.orgCity;
  data.orgState = dataIn.orgState ? dataIn.orgState : data.orgState;
  data.orgZipCode = dataIn.orgZipCode ? dataIn.orgZipCode : data.orgZipCode;
  data.orgCellphone = dataIn.orgCellphone ? dataIn.orgCellphone : data.orgCellphone;
  data.orgHomephone = dataIn.orgHomephone ? dataIn.orgHomephone : data.orgHomephone;
  data.orgAltPhone = dataIn.orgAltPhone ? dataIn.orgAltPhone : data.orgAltPhone;
  data.orgEmail = dataIn.orgEmail ? dataIn.orgEmail : data.orgEmail;
  data.orgHeader = dataIn.orgHeader ? dataIn.orgHeader : data.orgHeader;

  return data.save();
};

const get = async (tenantId, appId) => await Organization.findAll({ where: { tenantId, appId },
  include: [{
    model: OrganizationLicense,
    as: "rowFormData",
  }],
});

const del = async (orgId) => {
  const org = await Organization.findByPk(orgId);
  await org.destroy();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.orgId = id; }
  if (dataIn.orgStreetAddress === null) { delete dataIn.orgStreetAddress; }
  if (dataIn.orgCity === null) { delete dataIn.orgCity; }
  if (dataIn.orgState === null) { delete dataIn.orgState; }
  if (dataIn.orgZipCode === null) { delete dataIn.orgZipCode; }
  if (dataIn.orgCellphone === null) { delete dataIn.orgCellphone; }
  if (dataIn.orgHomephone === null) { delete dataIn.orgHomephone; }
  if (dataIn.orgAltPhone === null) { delete dataIn.orgAltPhone; }
  if (dataIn.orgEmail === null) { delete dataIn.orgEmail; }
  if (dataIn.orgHeader === null) { delete dataIn.orgHeader; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    logger.info("dataIn: ", dataIn);
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    // const tenant = await Tenant.findOne({where:{tenantId:value.tenantId}});
    // if (tenant==null) throw `tenantId can not be null!`;
    const app = await appGetById(value.tenantId, value.appId);
    if (app == null) { throw new Error("Invalid tenant / app !"); }

    return value;
  }
};

module.exports = {
  Organization,
  create,
  update,
  get,
  getById,
  validate,
  del,
};

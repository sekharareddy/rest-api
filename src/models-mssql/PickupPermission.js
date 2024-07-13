const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class PickupPermission extends Model { }

PickupPermission.init({
  applicationPickupPermissionsId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  appId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  orgId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userFamilyId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userChildrenId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  applicationNumber: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  userChildName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pickupAuthCodePrefix: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pickupAuthCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pickupAuthCodeFull: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.NUMBER,
  },
}, {
  sequelize,
  modelName: "PickupPermission",
  tableName: "vw_PickupPermissions",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  applicationPickupPermissionsId: JOI.string(),
  userId: JOI.string().required(),
  pickupAuthCode: JOI.string().required().min(1).max(20),
  isDeleted: JOI.number(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const get = async (userId) => PickupPermission.findAll({
  where: {
    userId,
    applicationStatus: "APPROVED",
    isDeleted: 0,
  },
});
const getById = async (id, userId) => PickupPermission.findOne({
  where: {
    applicationPickupPermissionsId: id,
    userId,
    isDeleted: 0,
  },
});
const getByAuthCode = async (tenantId, appId, orgId, AuthCode) => PickupPermission.findOne({
  where: {
    tenantId,
    appId,
    orgId,
    pickupAuthCodeFull: AuthCode,
    applicationStatus: "Approved",
    isDeleted: 0,
  },
});
const update = async (dataIn) => {
  const data = await getById(dataIn.applicationPickupPermissionsId, dataIn.userId);
  // only pickupAuthCode is allowed to be changed as per business rules
  data.pickupAuthCode = dataIn.pickupAuthCode ? dataIn.pickupAuthCode : data.pickupAuthCode;
  return data.save();
};

const validate = async (dataIn, userId, id = null) => {
  if (id != null) { dataIn.applicationPickupPermissionsId = id; }
  dataIn.userId = userId;
  if (dataIn.pickupAuthCode === null || dataIn.pickupAuthCode === "") { delete dataIn.pickupAuthCode; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    return value;
  }
};

module.exports = {
  PickupPermission,
  get,
  getByAuthCode,
  update,
  validate,
};

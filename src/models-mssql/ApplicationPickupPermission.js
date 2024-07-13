const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { UserFamily } = require("./UserFamily");

class ApplicationPickupPermission extends Model {}
ApplicationPickupPermission.init({
  applicationPickupPermissionsId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  applicationId: {
    type: DataTypes.UUID,
  },
  userFamilyId: {
    type: DataTypes.UUID,
  },
  relationship: {
    type: DataTypes.STRING,
  },
  isDeleted: {
    type: DataTypes.NUMBER,
  },
  lastUpdatedDateTime: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: "ApplicationPickupPermission",
  tableName: "applicationPickupPermissions",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

ApplicationPickupPermission.belongsTo(UserFamily, {
  foreignKey: "userFamilyId",
});

const joiSchema = JOI.object().keys({
  applicationPickupPermissionsId: JOI.string(),
  applicationId: JOI.string().required(),
  userFamilyId: JOI.string(),
  relationship: JOI.string(),
  isDeleted: JOI.number(),
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
  modelData = ApplicationPickupPermission.build(dataIn);
  return modelData.save();
};

const get = async (applicationId) => ApplicationPickupPermission.findAll({ where: {
  applicationId,
  isDeleted: 0,
},
include: [
  { model: UserFamily },
] });
const getById = async (id) => ApplicationPickupPermission.findByPk(
  id,
  { where: {
    applicationId,
    isDeleted: 0,
  } },
);

const del = async (id) => {
  const data = await ApplicationPickupPermission.findByPk(id);
  data.isDeleted = 1;
  return data.save();
};

const update = async (dataIn) => {
  const data = await getById(dataIn.applicationPickupPermissionsId);
  // only sendUserMessageEmail is allowed to be changed as per business rules
  data.userFamilyId = dataIn.userFamilyId ? dataIn.userFamilyId : data.userFamilyId;
  data.relationship = dataIn.relationship ? dataIn.relationship : data.relationship;
  data.isDeleted = dataIn.isDeleted ? dataInisDeleted : data.isDeleted;
  return data.save();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.applicationPickupPermissionsId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    const pp = ApplicationPickupPermission.findAll({
      where: { applicationId: dataIn.applicationId, userFamilyId: dataIn.userFamilyId },
    });
    if (pp && pp.length > 0) {
      throw new Error("Pickup Permission for given application/ user Family member already Exists!");
    }
    // validate foreign keys and any other business requiremets
    return value;
  }
};

module.exports = {
  ApplicationPickupPermission,
  create,
  get,
  getById,
  validate,
  del,
  update,
};

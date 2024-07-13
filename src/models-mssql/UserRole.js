const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { Role } = require("./Role");

class UserRole extends Model {}
UserRole.init({
  userRoleId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
  },
  roleId: {
    type: DataTypes.UUID,
  },
  tenantId: {
    type: DataTypes.UUID,
  },
  appId: {
    type: DataTypes.UUID,
  },
  sendUserMessageEmail: {
    type: DataTypes.BOOLEAN,
  },
  lastUpdatedDateTime: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: "UserRole",
  tableName: "userRoles",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  userRoleId: JOI.string(),
  userId: JOI.string().required(),
  roleId: JOI.string().required(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  sendUserMessageEmail: JOI.boolean(),
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
  modelData = UserRole.build(dataIn);
  // console.log('userRole:', modelData);
  return modelData.save();
};

const get = async (tenantId, appId) => UserRole.findOne({ where: {
  tenantId,
  appId,
} });
const getById = async (id) => UserRole.findByPk(id);

const del = async (userRoleId) => {
  await UserRole.findByPk(userRoleId)
    .then(async (userRole) => {
      await userRole.destroy();
    })
    .catch((err) => {
      console.log(err);
    });
};

const update = async (dataIn) => {
  const data = await getById(dataIn.userRoleId);
  // only sendUserMessageEmail is allowed to be changed as per business rules
  data.sendUserMessageEmail = dataIn.sendUserMessageEmail ? dataIn.sendUserMessageEmail : data.sendUserMessageEmail;
  return data.save();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.userRoleId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    return value;
  }
};

module.exports = {
  UserRole,
  create,
  get,
  getById,
  validate,
  del,
  update,
};

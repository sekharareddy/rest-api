const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

const { getPages } = require("./Page");

class UserSession extends Model { }

UserSession.init({
  userSessionId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
  },
  appId: {
    type: DataTypes.UUID,
  },
  userId: {
    type: DataTypes.UUID,
  },
  userSessionStartTime: {
    type: DataTypes.DATE,
  },
  userSessionEndTime: {
    type: DataTypes.DATE,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,

  },
}, {
  sequelize,
  modelName: "UserSession",
  tableName: "userSessions",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  userSessionId: JOI.string(),
  tenantId: JOI.string(),
  appId: JOI.string(),
  userId: JOI.string(),
  userSessionStartTime: JOI.date(),
  userSessionEndTime: JOI.date(),
  lastUpdateDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (dataIn, user) => {
  let modelData;
  delete user.dataValues.password_hash;
  delete user.dataValues.authCodePrefix;
  delete user.dataValues.authCode;

  modelData = UserSession.build(dataIn);
  // let userId = modelData.userId;
  await modelData.save();
  const pages = await getPages({ tenantId: modelData.tenantId, appId: modelData.appId, isPrivate: 1 });
  const data = { user: user.dataValues, pages, ...modelData };
  return data;
};

const getById = async (id) => await UserSession.findByPk(id);

const update = async (dataIn) => {
  const data = await getById(dataIn.userSessionId);
  // only userSessionEndTime is allowed to be changed as per business rules
  data.userSessionEndTime = new Date();
  return await data.save();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.userSessionId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
  } else {
    // validate foreign keys and any other business requiremets
    // const tenant = await Tenant.findOne({where:{tenantId:value.tenantId}});
    // if (tenant==null) throw `tenantId can not be null!`;

    return value;
    // return generate(value);
  }
};

module.exports = {
  UserSession,
  create,
  update,
  getById,
  validate,
};

const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class AppUserLogin extends Model { }
AppUserLogin.init({
  userLoginId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  oAuth_iss: {
    type: DataTypes.STRING,
  },
  oAuth_sub: {
    type: DataTypes.STRING,
  },
  tokenSource: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: "AppUserLogin",
  tableName: "userLogins",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  userLoginId: JOI.string(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  userId: JOI.string().required(),
  email: JOI.string(),
  tokenSource: JOI.string().required(),
  oAuth_iss: JOI.string(),
  oAuth_sub: JOI.string(),
  lastUpdateDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: false, // remove unknown keys from the validated data
};

const create = async (dataIn) => {
  let modelData;
  modelData = AppUserLogin.build(await validate(dataIn));
  return await modelData.save();
};

const getById = async (tenantId, appId, id) => AppUserLogin.findOne({
  where: { tenantId, appId, userLoginId: id },
});

const update = async (dataIn) => {
  const data = await getById(dataIn.userLoginId);
  // only appName is allowed to be changed, tenantId is not allowed to change as per business rules
  // data.userFirstName = dataIn.userFirstName?dataIn.userFirstName:data.userFirstName;
  // data.userLastName = dataIn.userLastName?dataIn.userLastName:data.userLastName;
  // data.userFullName = dataIn.userFullName?dataIn.userFullName:data.userFullName;
  // data.userType = dataIn.userType?dataIn.userType:data.userType;
  // data.userName = dataIn.userName?dataIn.userName:data.userName;
  // data.pictureURL = dataIn.pictureURL?dataIn.pictureURL:data.pictureURL;
  // data.active = dataIn.active?dataIn.active:data.active;
  // data.authCode = dataIn.authCode?dataIn.authCode:data.authCode;
  return data.save();
};

const get = async (tenantId, appId, tokenSource, email = null, fb_userId = null) => {
  const whereClause = { tenantId, appId, tokenSource };
  if (email == null) { return []; }
  if (email != null && email != "") { whereClause.email = email; }
  return await AppUserLogin.findAll({ where: whereClause });
};

const del = async (userLoginId) => {
  const user = await AppUserLogin.findByPk(userLoginId);
  await user.destroy();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.userLoginId = id; }
  if (dataIn.email === null) { delete dataIn.email; }
  if (dataIn.oAuth_iss === null) { delete dataIn.oAuth_iss; }
  if (dataIn.oAuth_sub === null) { delete dataIn.oAuth_sub; }
  if (dataIn.tokenSource === null) { delete dataIn.tokenSource; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    // const tenant = await Tenant.findOne({where:{tenantId:value.tenantId}});
    // if (tenant==null) throw `tenantId can not be null!`;

    return value;
  }
};

module.exports = {
  AppUserLogin,
  create,
  update,
  get,
  getById,
  validate,
  del,
};

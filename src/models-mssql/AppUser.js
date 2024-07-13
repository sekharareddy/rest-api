const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { Role } = require("./Role");
const { UserRole } = require("./UserRole");
const createUserRole = require("./UserRole").create;
const { UserFamily } = require("./UserFamily");
const createUserFamily = require("./UserFamily").create;
const { UserChildren } = require("./UserChildren");
const { Application } = require("./Application");
const { App } = require("./App");
const { AppUserLogin } = require("./AppUserLogin");
const getUserLogin = require("./AppUserLogin").get;
const createAppUserLogin = require("./AppUserLogin").create;

const { gt, lte, ne, in: opIn } = Sequelize.Op;

class AppUser extends Model { }
AppUser.init({
  userId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userType: {
    type: DataTypes.STRING,
  },
  userLastName: {
    type: DataTypes.STRING,
  },
  userFirstName: {
    type: DataTypes.STRING,
  },
  userFullName: {
    type: DataTypes.STRING,
  },
  startDate: {
    type: DataTypes.DATE,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  oAuth_iss: {
    type: DataTypes.STRING,
  },
  oAuth_sub: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  pictureURL: {
    type: DataTypes.STRING,
  },
  active: {
    type: DataTypes.BOOLEAN,
  },
  tenantId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  appId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  orgId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  authCodePrefix: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  authCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  allow_local_login: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  biometric_fp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: "AppUser",
  tableName: "users",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  userId: JOI.string(),
  email: JOI.string(),
  userName: JOI.string(),
  userType: JOI.string(),
  userLastName: JOI.string(),
  userFirstName: JOI.string(),
  userFullName: JOI.string().required(),
  startDate: JOI.date(),
  endDate: JOI.date(),
  active: JOI.boolean(),
  pictureURL: JOI.string(),
  lastUpdateDateTime: JOI.date(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  orgId: JOI.string().required(),
  authCode: JOI.string(),
  password_hash: JOI.string().allow(null),
  allow_local_login: JOI.boolean(),
  biometric_fp: JOI.string().allow(null).allow(""),
  rowFormData: JOI.array(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: false, // remove unknown keys from the validated data
};

const appUserRoleId = "AF31655A-065A-462C-84B7-3E166F41BAFE"; // AppUser role

AppUser.belongsToMany(Role, {
  through: "UserRole",
  foreignKey: "userId",
  as: "userRoles",
});

Role.belongsToMany(AppUser, {
  through: "UserRole",
  foreignKey: "roleId",
  as: "userRoles",
});

AppUser.hasMany(UserRole, {
  foreignKey: "userId",
  as: "rowFormData",
});

AppUser.hasMany(Application, {
  foreignKey: "userId",
  as: "userApplications",
});

AppUser.hasMany(AppUserLogin, {
  foreignKey: "userId",
  as: "userLogins",
});

AppUser.hasMany(UserFamily, {
  foreignKey: "userId",
  as: "UserFamily",
});

AppUser.hasMany(UserChildren, {
  foreignKey: "userId",
  as: "UserChildren",
});

const create = async (dataIn, tenantId, appId, orgId, req_user, tokenSource) => {
  console.log("158-AppUser-create() ", dataIn);
  let user = await getUserByLogin(tenantId, appId, tokenSource, dataIn.email);
  if (!user) {
    userLogin = {
      tokenSource,
      email: dataIn.email,
      tenantId,
      appId,
      orgId,
    };
    appUser = {
      userName: dataIn.email,
      tokenSource,
      email: dataIn.email,
      tenantId,
      appId,
      orgId,
    };
    if (dataIn.userFirstName) { appUser.userFirstName = dataIn.userFirstName; }
    if (dataIn.userLastName) { appUser.userLastName = dataIn.userLastName; }
    if (dataIn.userFullName) { appUser.userFullName = dataIn.userFullName; }

    user = await createUser(appUser, userLogin);
  }
  return user;
};

const createUser = async (appUser, userLogin) => {
  let modelData;
  appUser = await validate(appUser);
  modelData = await AppUser.findOne({
    where: {
      tenantId: appUser.tenantId,
      appId: appUser.appId,
      orgId: appUser.orgId,
      active: 1,
      email: appUser.email,
    },
  });
  if (!modelData) {
    modelData = AppUser.build(appUser);
    await modelData.save();
  }
  userLogin.userId = modelData.userId;
  await createAppUserLogin(userLogin);
  const appUserRoleData = {
    tenantId: modelData.tenantId,
    appId: modelData.appId,
    orgId: modelData.orgId,
    userId: modelData.userId,
    roleId: appUserRoleId,
  };
  await createUserRole(appUserRoleData);
  // add call to createUserFamily();
  const userFamilyData = {
    userId: modelData.userId,
    userFamilyMemberName: modelData.userFullName,
    userFamilyMemberRelationship: "SELF",
    userFamilyMemberEmail: modelData.email,
    userFamilyMemberIsFamily: 1,
    userFamilyMemberIsEmContact: 0,
    userFamilyMemberPickupPermissions: 1,
  };
  await createUserFamily(userFamilyData);

  return getById(modelData.tenantId, modelData.appId, modelData.userId);
};

const getUserByEmail = async (tenantId, appId, email) => AppUser.findOne({
  where: { tenantId, appId, userName: email, active: 1 },
  include: [{
    model: Role,
    attributes: ["roleName", "roleId"],
    as: "userRoles",
  },
  {
    model: UserFamily,
    as: "UserFamily",
    where: { userFamilyMemberRelationship: "SELF" },
  },
  {
    model: UserRole,
    as: "rowFormData",
  },
  ],
});

const getUserByLogin = async (tenantId, appId, tokenSource, email = null, fb_userId = null) => {
  const userLogins = await getUserLogin(tenantId, appId, tokenSource, email);
  if (!userLogins || userLogins.length <= 0 || !userLogins[0].dataValues) { return; }
  const qry_email = userLogins[0].dataValues.email;
  return AppUser.findOne({
    where: { tenantId, appId, email: qry_email, active: 1 },
    include: [{
      model: Role,
      attributes: ["roleName", "roleId"],
      as: "userRoles",
      required: false,
    },
    {
      model: UserFamily,
      as: "UserFamily",
      where: { userFamilyMemberRelationship: "SELF" },
      required: false,
    },
    {
      model: Application,
      as: "userApplications",
      required: false,
    },
    {
      model: UserRole,
      as: "rowFormData",
      required: false,
    },
    {
      model: AppUserLogin,
      as: "userLogins",
      required: false,
    },
    ],
  });
};

const getUserByPasswordHash = async (tenantId, appId, tokenSource, email = null, password_hash = null) => {
  const userLogins = await getUserLogin(tenantId, appId, tokenSource, email);
  if (!userLogins || userLogins.length <= 0 || !userLogins[0].dataValues) {
    return null;
  }
  const qry_email = userLogins[0].dataValues.email;
  console.log({ tenantId, appId, email: qry_email, password_hash, active: 1 });
  const appUser = await AppUser.findOne({
    where: { tenantId, appId, email: qry_email, password_hash, active: 1 },
  });
  if (appUser) {
    delete appUser.dataValues.password_hash;
    console.log(appUser);
    const jwt = Buffer.from(JSON.stringify(appUser), "utf8").toString("base64");
    return jwt;
  }
  return null;
};

const getByAuthCode = async (tenantId, appId, orgId, authCodeFull) => {
  console.log("getByAuthCode(): ", authCodeFull);
  if (!authCodeFull || (authCodeFull && authCodeFull.length <= 3)) {
    return null;
  }
  // console.log(tenantId, appId, authCodeFull.substring(0, 3), authCodeFull.substring(3, authCodeFull.length), 1)
  return AppUser.findOne(
    {
      where: {
        tenantId,
        appId,
        authCodePrefix: authCodeFull.substring(0, 3),
        authCode: authCodeFull.substring(3, authCodeFull.length),
        active: 1,
      },
      include:
                [
                  {
                    model: Role,
                    attributes: ["roleName", "roleId"],
                    as: "userRoles",
                    required: false,
                  },
                  {
                    model: UserFamily,
                    as: "UserFamily",
                    where: { userFamilyMemberRelationship: "SELF" },
                    required: false,
                  },
                  {
                    model: Application,
                    as: "userApplications",
                    required: false,
                  },
                  {
                    model: UserRole,
                    as: "rowFormData",
                    required: false,
                  },
                ],
    },
  );
};

const getById = async (tenantId, appId, id) => AppUser.findOne({
  where: { tenantId, appId, userId: id, active: 1 },
  include: [{
    model: Role,
    attributes: ["roleName", "roleId"],
    as: "userRoles",
    required: false,
  },
  {
    model: UserFamily,
    as: "UserFamily",
    where: { userFamilyMemberRelationship: "SELF" },
    required: false,
  },
  {
    model: Application,
    as: "userApplications",
    required: false,
  },
  {
    model: UserRole,
    as: "rowFormData",
    required: false,
  },
  ],
});

const update = async (dataIn) => {
  const data = await getById(dataIn.tenantId, dataIn.appId, dataIn.userId);
  // only appName is allowed to be changed, tenantId is not allowed to change as per business rules
  data.userFirstName = dataIn.userFirstName ? dataIn.userFirstName : data.userFirstName;
  data.userLastName = dataIn.userLastName ? dataIn.userLastName : data.userLastName;
  data.userFullName = dataIn.userFullName ? dataIn.userFullName : data.userFullName;
  data.userType = dataIn.userType ? dataIn.userType : data.userType;
  data.userName = dataIn.userName ? dataIn.userName : data.userName;
  data.pictureURL = dataIn.pictureURL ? dataIn.pictureURL : data.pictureURL;
  data.active = dataIn.active ? dataIn.active : data.active;
  data.authCode = dataIn.authCode ? dataIn.authCode : data.authCode;
  data.password_hash = dataIn.password_hash ? dataIn.password_hash : data.password_hash;
  data.biometric_fp = dataIn.biometric_fp ? dataIn.biometric_fp : data.biometric_fp;
  if (dataIn.allow_local_login) {
    const userLogins = await getUserLogin(data.tenantId, data.appId, "local", data.email);
    if (!userLogins || userLogins.length == 0) {
      console.log(335);
      const userLogin = {
        tokenSource: "local",
        email: data.email,
        tenantId: data.tenantId,
        appId: data.appId,
        orgId: data.orgId,
        userId: data.userId,
      };
      await createAppUserLogin(userLogin);
    } else { console.log(346); }
  }
  data.allow_local_login = dataIn.allow_local_login ? dataIn.allow_local_login : data.allow_local_login;
  await data.save();
  return getById(data.tenantId, data.appId, data.orgId, data.userId);
};

const get = async (qry) => {
  const appUser = await AppUser.findAll({
    where: { tenantId: qry.tenantId, appId: qry.appId, active: 1 },
    include: [{
      model: Role,
      attributes: ["roleName", "roleId"],
      as: "userRoles",
      required: false, // ,
      // where: {roleId: {[ne]:appUserRoleId}}
    },
    {
      model: UserFamily,
      as: "UserFamily",
      where: { userFamilyMemberRelationship: { [ne]: "SELF" } },
      required: false,
    },
    {
      model: Application,
      as: "userApplications",
      required: false,
    },
    {
      model: UserChildren,
      as: "UserChildren",
      required: false,
    },
    {
      model: UserRole,
      as: "rowFormData",
      required: false,
    },
    ],
  });
  return appUser;
};

const del = async (tenantId, appId, userId) => {
  const user = await AppUser.findByPk(
    userId,
    {
      where: {
        tenantId, appId,
      },
    },
  );
  await user.destroy();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.userId = id; }
  if (dataIn.endDate === null) { delete dataIn.endDate; }
  if (dataIn.email === null) { delete dataIn.email; }
  if (dataIn.oAuth_iss === null) { delete dataIn.oAuth_iss; }
  if (dataIn.oAuth_sub === null) { delete dataIn.oAuth_sub; }
  if (dataIn.userType === null) { delete dataIn.userType; }
  if (dataIn.pictureURL === null) { delete dataIn.pictureURL; }
  if (dataIn.userFirstName === null) { delete dataIn.userFirstName; }
  if (dataIn.userLastName === null) { delete dataIn.userLastName; }
  if (dataIn.userFullName === null) { delete dataIn.userFullName; }
  if (dataIn.authCode === null) { delete dataIn.authCode; }
  if (dataIn.password_hash === null) { delete dataIn.password_hash; }
  if (dataIn.allow_local_login === null) { delete dataIn.allow_local_login; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    // const tenant = await Tenant.findOne({where:{tenantId:value.tenantId}});
    // if (tenant==null) throw `tenantId can not be null!`;
    const app = await App.findOne({ where: { tenantId: value.tenantId, appId: value.appId } });
    if (app == null) { throw new Error("tenantId/ appId can not be null!"); }

    return value;
  }
};

module.exports = {
  AppUser,
  getUserByEmail,
  getUserByLogin,
  getByAuthCode,
  getUserByPasswordHash,
  create,
  createUser,
  update,
  get,
  getById,
  validate,
  del,
};

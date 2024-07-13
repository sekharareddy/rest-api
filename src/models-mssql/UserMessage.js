const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { AppUser } = require("./AppUser");

class UserMessage extends Model { }
UserMessage.init({
  UserMessageId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
  },
  tenantId: {
    type: DataTypes.UUID,
  },
  appId: {
    type: DataTypes.UUID,
  },
  targetUserId: {
    type: DataTypes.UUID,
  },
  parentMessageId: {
    type: DataTypes.UUID,
  },
  subject: {
    type: DataTypes.STRING,
  },
  message: {
    type: DataTypes.STRING,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
  },
  createdDateTime: {
    type: DataTypes.DATE,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: "UserMessage",
  tableName: "userMessages",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

UserMessage.belongsTo(AppUser, {
  foreignKey: "userId",
});

UserMessage.hasMany(UserMessage, {
  foreignKey: "parentMessageId",
  as: "childMessages",
});

const joiSchema = JOI.object().keys({
  userMessageId: JOI.string(),
  userId: JOI.string(),
  tenantId: JOI.string(),
  appId: JOI.string(),
  targetUserId: JOI.string(),
  parentMessageId: JOI.string(),
  subject: JOI.string(),
  message: JOI.string(),
  isDeleted: JOI.boolean(),
  lastUpdateDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (dataIn) => {
  console.log("userMesssage Create ..");
  let modelData;
  modelData = UserMessage.build(dataIn);
  modelData = await modelData.save();
  if (modelData.parentMessageId) {
    const parentMessage = await UserMessage.findByPk(modelData.parentMessageId);
    const dt = new Date();
    let mth = dt.getMonth();
    mth = mth <= 8 ? `0${mth + 1}` : (mth + 1);
    let dte = dt.getDate();
    dte = dte <= 9 ? `0${dte}` : dte;
    parentMessage.lastUpdatedDateTime = `${dt.getFullYear()}-${mth}-${dte} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}.${dt.getMilliseconds()}`;
    await parentMessage.save();
  }
  console.log("returning ");
  return modelData;
};

const get = async (tenantId, appId, roleId, user) => {
  const isDeleted = 0;
  const { userId } = user;

  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Staff" || role.roleName == "Support Staff")
            && role.roleId == roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = { tenantId, appId, isDeleted };
  if (!userHasStaffRole) {
    whereClause.userId = userId;
  }
  whereClause.parentMessageId = null;
  return UserMessage.findAll({
    where: whereClause,
    include: [
      { model: AppUser },
      { model: UserMessage, as: "childMessages" },
    ],
    order: [["lastUpdatedDateTime", "DESC"]],
  });
};
const getById = async (id) => {
  const userMessage = await UserMessage.findByPk(id);
  if (userMessage.isDeleted == -0) {
    return userMessage;
  }

  return {};
};

const del = async (userMessageId) => {
  const userMessage = await UserMessage.findByPk(userMessageId);
  userMessage.isDeleted = 1; // soft delete
  await userMessage.save();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.userMessageId = id; }
  if (dataIn.parentMessageId == null || dataIn.parentMessageId == "") { delete dataIn.parentMessageId; }
  if (dataIn.targetUserId == null || dataIn.targetUserId == "") { delete dataIn.targetUserId; }
  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    return value;
  }
};

module.exports = {
  UserMessage,
  create,
  get,
  getById,
  validate,
  del,
};

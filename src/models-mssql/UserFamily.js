const { Sequelize, DataTypes, Model, Op } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class UserFamily extends Model {}

UserFamily.init({
  userFamilyId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
  },
  userFamilyMemberName: {
    type: DataTypes.STRING,
  },
  userFamilyMemberRelationship: {
    type: DataTypes.STRING,
  },
  userFamilyMemberEmail: {
    type: DataTypes.STRING,
  },
  userFamilyMemberInviteStatus: {
    type: DataTypes.BOOLEAN,
  },
  userFamilyMemberCellphone: {
    type: DataTypes.STRING,
  },
  userFamilyMemberHomephone: {
    type: DataTypes.STRING,
  },
  userFamilyMemberAltPhone: {
    type: DataTypes.STRING,
  },
  userFamilyMemberIsFamily: {
    type: DataTypes.BOOLEAN,
  },
  userFamilyMemberIsEmContact: {
    type: DataTypes.BOOLEAN,
  },
  userFamilyMemberPickupPermissions: {
    type: DataTypes.BOOLEAN,
  },
  userFamilyMemberStreetAddress: {
    type: DataTypes.STRING,
  },
  userFamilyMemberCity: {
    type: DataTypes.STRING,
  },
  userFamilyMemberState: {
    type: DataTypes.STRING,
  },
  userFamilyMemberZipCode: {
    type: DataTypes.STRING,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,

  },
}, {
  sequelize,
  modelName: "UserFamily",
  tableName: "UserFamily",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  userFamilyId: JOI.string(),
  userId: JOI.string().required(),
  userFamilyMemberName: JOI.string(),
  userFamilyMemberRelationship: JOI.string(),
  userFamilyMemberEmail: JOI.string(),
  userFamilyMemberInviteStatus: JOI.boolean(),
  userFamilyMemberCellphone: JOI.string(),
  userFamilyMemberHomephone: JOI.string(),
  userFamilyMemberAltPhone: JOI.string(),
  userFamilyMemberIsFamily: JOI.boolean(),
  userFamilyMemberIsEmContact: JOI.boolean(),
  userFamilyMemberPickupPermissions: JOI.boolean(),
  userFamilyMemberStreetAddress: JOI.string(),
  userFamilyMemberCity: JOI.string(),
  userFamilyMemberState: JOI.string(),
  userFamilyMemberZipCode: JOI.string(),
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
  modelData = UserFamily.build(dataIn);
  await modelData.save();
};
const get = async (userId) => await UserFamily.findAll({ where: { userId, userFamilyMemberRelationship: { [Op.ne]: "SELF" } } });
const getSelf = async (userId) => await UserFamily.findOne({ where: { userId, userFamilyMemberRelationship: { [Op.eq]: "SELF" } } });

const getById = async (id) => await UserFamily.findByPk(id);

const update = async (dataIn) => {
  const data = await getById(dataIn.userFamilyId);
  if (!data) { throw new Error("Invalid UserFamilyId!"); }
  data.userFamilyMemberName = dataIn.userFamilyMemberName ? dataIn.userFamilyMemberName : data.userFamilyMemberName;
  data.userFamilyMemberRelationship = dataIn.userFamilyMemberRelationship ? dataIn.userFamilyMemberRelationship : data.userFamilyMemberRelationship;
  data.userFamilyMemberEmail = dataIn.userFamilyMemberEmail ? dataIn.userFamilyMemberEmail : data.userFamilyMemberEmail;
  data.userFamilyMemberCellphone = dataIn.userFamilyMemberCellphone ? dataIn.userFamilyMemberCellphone : data.userFamilyMemberCellphone;
  data.userFamilyMemberHomephone = dataIn.userFamilyMemberHomephone ? dataIn.userFamilyMemberHomephone : data.userFamilyMemberHomephone;
  data.userFamilyMemberAltPhone = dataIn.userFamilyMemberAltPhone ? dataIn.userFamilyMemberAltPhone : data.userFamilyMemberAltPhone;
  data.userFamilyMemberIsFamily = dataIn.userFamilyMemberIsFamily ? dataIn.userFamilyMemberIsFamily : data.userFamilyMemberIsFamily;
  data.userFamilyMemberIsEmContact = dataIn.userFamilyMemberIsEmContact ? dataIn.userFamilyMemberIsEmContact : data.userFamilyMemberIsEmContact;
  data.userFamilyMemberPickupPermissions = dataIn.userFamilyMemberPickupPermissions ? dataIn.userFamilyMemberPickupPermissions : data.userFamilyMemberPickupPermissions;
  data.userFamilyMemberStreetAddress = dataIn.userFamilyMemberStreetAddress ? dataIn.userFamilyMemberStreetAddress : data.userFamilyMemberStreetAddress;
  data.userFamilyMemberCity = dataIn.userFamilyMemberCity ? dataIn.userFamilyMemberCity : data.userFamilyMemberCity;
  data.userFamilyMemberState = dataIn.userFamilyMemberState ? dataIn.userFamilyMemberState : data.userFamilyMemberState;
  data.userFamilyMemberZipCode = dataIn.userFamilyMemberZipCode ? dataIn.userFamilyMemberZipCode : data.userFamilyMemberZipCode;
  // data.userFamilyMemberInviteStatus = dataIn.userFamilyMemberInviteStatus?dataIn.userFamilyMemberInviteStatus:data.userFamilyMemberInviteStatus;

  return await data.save();
};
const del = async (id) => {
  const userFamily = await getById(id);
  await userFamily.destroy();
};

const validate = async (dataIn, userId, id = null) => {
  if (id != null) { dataIn.userFamilyId = id; }
  if (!dataIn.userId) { dataIn.userId = userId; }
  if (dataIn.userFamilyMemberCellphone == "") { delete dataIn.userFamilyMemberCellphone; }
  if (dataIn.userFamilyMemberHomephone == "") { delete dataIn.userFamilyMemberHomephone; }
  if (dataIn.userFamilyMemberAltPhone == "") { delete dataIn.userFamilyMemberAltPhone; }
  if (dataIn.userFamilyMemberEmail == "") { delete dataIn.userFamilyMemberEmail; }
  if (dataIn.userFamilyMemberStreetAddress == "") { delete dataIn.userFamilyMemberStreetAddress; }
  if (dataIn.userFamilyMemberCity == "") { delete dataIn.userFamilyMemberCity; }
  if (dataIn.userFamilyMemberState == "") { delete dataIn.userFamilyMemberState; }
  if (dataIn.userFamilyMemberZipCode == "") { delete dataIn.userFamilyMemberZipCode; }
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
  UserFamily,
  create,
  update,
  getById,
  get,
  getSelf,
  del,
  validate,
};

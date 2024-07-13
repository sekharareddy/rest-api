const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class UserChildren extends Model {}

UserChildren.init({
  userChildrenId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
  },
  userChildName: {
    type: DataTypes.STRING,
  },
  userChildGender: {
    type: DataTypes.STRING,
  },
  userChildAgeMonths: {
    type: DataTypes.NUMBER,
  },
  firstName: {
    type: DataTypes.STRING,
  },
  middleName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  birthDate: {
    type: DataTypes.DATE,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,

  },
}, {
  sequelize,
  modelName: "UserChildren",
  tableName: "UserChildren",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  userFamilyId: JOI.string(),
  userId: JOI.string().required(),
  userChildName: JOI.string(),
  userChildGender: JOI.string(),
  userChildAgeMonths: JOI.number(),
  birthDate: JOI.date(),
  firstName: JOI.string(),
  middleName: JOI.string(),
  lastName: JOI.string(),
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
  modelData = UserChildren.build(dataIn);
  await modelData.save();
};
const get = async (userId) => await UserChildren.findAll({ where: { userId } });
const getById = async (id) => await UserChildren.findByPk(id);

const update = async (dataIn) => {
  const data = await getById(dataIn.userFamilyId);
  data.userChildName = dataIn.userChildName ? dataIn.userChildName : data.userChildName;
  data.userChildGender = dataIn.userChildGender ? dataIn.userChildGender : data.userChildGender;
  data.userChildAgeMonths = dataIn.userChildAgeMonths ? dataIn.userChildAgeMonths : data.userChildAgeMonths;
  data.birthDate = dataIn.birthDate ? dataIn.birthDate : data.birthDate;
  data.firstName = dataIn.firstName ? dataIn.firstName : data.firstName;
  data.middleName = dataIn.middleName ? dataIn.middleName : data.middleName;
  data.lastName = dataIn.lastName ? dataIn.lastName : data.lastName;

  return await data.save();
};
const del = async (id) => {
  const UserChildren = await getById(id);
  await UserChildren.destroy();
};

const validate = async (dataIn, userId, id = null) => {
  if (id != null) { dataIn.userFamilyId = id; }
  if (!dataIn.userId) { dataIn.userId = userId; }

  if (dataIn.userChildGender == "") { delete dataIn.userChildGender; }
  if (dataIn.userChildAgeMonths == "") { delete dataIn.userChildAgeMonths; }

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
  UserChildren,
  create,
  update,
  getById,
  get,
  del,
  validate,
};

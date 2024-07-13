const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { UserFamily } = require("./UserFamily");

class ApplicationEmergencyContact extends Model {}
ApplicationEmergencyContact.init({
  applicationEmergencyContactsId: {
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
  lastUpdatedDateTime: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: "ApplicationEmergencyContact",
  tableName: "applicationEmergencyContacts",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

ApplicationEmergencyContact.belongsTo(UserFamily, {
  foreignKey: "userFamilyId",
});

const joiSchema = JOI.object().keys({
  applicationEmergencyContactsId: JOI.string(),
  applicationId: JOI.string().required(),
  userFamilyId: JOI.string(),
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
  modelData = ApplicationEmergencyContact.build(dataIn);
  return modelData.save();
};

const get = async (applicationId) => ApplicationEmergencyContact.findAll({ where: {
  applicationId,
},
include: [
  { model: UserFamily },
] });
const getById = async (id) => ApplicationEmergencyContact.findByPk(id);

const del = async (id) => {
  const applicationEmergencyContact = await ApplicationEmergencyContact.findByPk(id);
  await applicationEmergencyContact.destroy();
};

const update = async (dataIn) => {
  const data = await getById(dataIn.applicationEmergencyContactsId);
  // only sendUserMessageEmail is allowed to be changed as per business rules
  data.userFamilyId = dataIn.userFamilyId ? dataIn.userFamilyId : data.userFamilyId;
  return data.save();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.applicationEmergencyContactsId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    const ec = ApplicationEmergencyContact.findAll({
      where: { applicationId: dataIn.applicationId, userFamilyId: dataIn.userFamilyId },
    });
    if (ec && ec.length > 0) {
      throw new Error("Application Emergency Contact record for given application/ user Family member already Exists!");
    }

    return value;
  }
};

module.exports = {
  ApplicationEmergencyContact,
  create,
  get,
  getById,
  validate,
  del,
  update,
};

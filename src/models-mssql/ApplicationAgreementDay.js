const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class ApplicationAgreementDay extends Model {}
ApplicationAgreementDay.init({
  applicationAgreementDaysId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  applicationId: {
    type: DataTypes.UUID,
  },
  day_of_week: {
    type: DataTypes.STRING,
  },
  start_time: {
    type: DataTypes.STRING,
  },
  end_time: {
    type: DataTypes.STRING,
  },
  lastUpdatedDateTime: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: "ApplicationAgreementDay",
  tableName: "applicationAgreementDays",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  applicationAgreementDaysId: JOI.string(),
  applicationId: JOI.string().required(),
  day_of_week: JOI.string(),
  start_time: JOI.string(),
  end_time: JOI.string(),
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
  modelData = ApplicationAgreementDay.build(dataIn);
  return modelData.save();
};

const get = async (applicationId) => ApplicationAgreementDay.findAll({ where: {
  applicationId,
} });
const getById = async (id) => ApplicationAgreementDay.findByPk(id);

const del = async (id) => {
  const applicationParent = await ApplicationAgreementDay.findByPk(id);
  await applicationParent.destroy();
};

const update = async (dataIn) => {
  const data = await getById(dataIn.applicationAgreementDaysId);
  // only sendUserMessageEmail is allowed to be changed as per business rules
  data.day_of_week = dataIn.day_of_week ? dataIn.day_of_week : data.day_of_week;
  data.start_time = dataIn.start_time ? dataIn.start_time : data.start_time;
  data.end_time = dataIn.end_time ? dataIn.end_time : data.end_time;
  return data.save();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.applicationAgreementDaysId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    return value;
  }
};

module.exports = {
  ApplicationAgreementDay,
  create,
  get,
  getById,
  validate,
  del,
  update,
};

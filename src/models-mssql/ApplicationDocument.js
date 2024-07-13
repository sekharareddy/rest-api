const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class ApplicationDocument extends Model {}
ApplicationDocument.init({
  applicationDocumentsId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  applicationId: {
    type: DataTypes.UUID,
  },
  originalFileName: {
    type: DataTypes.STRING,
  },
  docType: {
    type: DataTypes.STRING,
  },
  fileName: {
    type: DataTypes.STRING,
  },
  filePath: {
    type: DataTypes.STRING,
  },
  fileURL: {
    type: DataTypes.STRING,
  },
  lastUpdatedDateTime: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: "ApplicationDocument",
  tableName: "applicationDocuments",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  applicationDocumentsId: JOI.string(),
  applicationId: JOI.string().required(),
  originalFileName: JOI.string().required(),
  docType: JOI.string().required(),
  fileName: JOI.string().required(),
  filePath: JOI.string().required(),
  fileURL: JOI.string().required(),
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
  modelData = ApplicationDocument.build(dataIn);
  return modelData.save();
};

const get = async (applicationId) => ApplicationDocument.findAll({ where: {
  applicationId,
} });
const getById = async (id) => ApplicationDocument.findByPk(id);

const del = async (id) => {
  const applicationDocument = await ApplicationDocument.findByPk(id);
  await applicationDocument.destroy();
};

const update = async (dataIn) => {
  const data = await getById(dataIn.applicationDocumentsId);
  data.originalFileName = dataIn.hasOwnProperty("originalFileName") ? dataIn.originalFileName : data.originalFileName;
  data.filePath = dataIn.hasOwnProperty("filePath") ? dataIn.filePath : data.filePath;
  data.docType = dataIn.hasOwnProperty("docType") ? dataIn.docType : data.docType;
  data.fileName = dataIn.hasOwnProperty("fileName") ? dataIn.fileName : data.fileName;
  data.fileURL = dataIn.hasOwnProperty("fileURL") ? dataIn.fileURL : data.fileURL;
  return data.save();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.applicationDocumentsId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    return value;
  }
};

module.exports = {
  ApplicationDocument,
  create,
  get,
  getById,
  validate,
  del,
  update,
};

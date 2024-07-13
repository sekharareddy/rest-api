const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class ApplicationDocType extends Model {}
ApplicationDocType.init({
  applicationDocTypeId: {
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
  orgId: {
    type: DataTypes.UUID,
  },
  docType: {
    type: DataTypes.STRING,
  },
  originalFileName: {
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
  modelName: "ApplicationDocType",
  tableName: "applicationDocTypes",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  applicationDocTypeId: JOI.string(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  orgId: JOI.string(),
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
  modelData = ApplicationDocType.build(dataIn);
  return modelData.save();
};

const get = async (tenantId = null, appId = null, orgId = null, applicationDocTypeId = null) => {
  const whereClause = {};
  if (tenantId != null) { whereClause.tenantId = tenantId; }
  if (appId != null) { whereClause.appId = appId; }
  if (orgId != null) { whereClause.orgId = orgId; }
  if (applicationDocTypeId != null) { whereClause.applicationDocTypeId = applicationDocTypeId; }
  return ApplicationDocType.findAll({ where: whereClause });
};

const getById = async (id) => ApplicationDocType.findByPk(id);

const del = async (id) => {
  const applicationDocType = await ApplicationDocType.findByPk(id);
  await applicationDocType.destroy();
};

const update = async (dataIn) => {
  const data = await getById(dataIn.applicationDocTypeId);
  data.originalFileName = dataIn.hasOwnProperty("originalFileName") ? dataIn.originalFileName : data.originalFileName;
  data.filePath = dataIn.hasOwnProperty("filePath") ? dataIn.filePath : data.filePath;
  data.docType = dataIn.hasOwnProperty("docType") ? dataIn.docType : data.docType;
  data.fileName = dataIn.hasOwnProperty("fileName") ? dataIn.fileName : data.fileName;
  data.fileURL = dataIn.hasOwnProperty("fileURL") ? dataIn.fileURL : data.fileURL;
  return data.save();
};

const validate = async (dataIn, user, id = null) => {
  if (id != null) {
    const doc = get(user.tenantId, user.appId, user.orgId, id);
    if (doc.length == 0) {
      throw new Error("Validation error: applicationDocType not found!");
    }
    dataIn.applicationDocTypeId = id;
  }
  dataIn.tenantId = user.tenantId;
  dataIn.appId = user.appId;
  if (user.orgId) { dataIn.orgId = user.orgId; }
  console.log(dataIn);
  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    if (get(dataIn.tenantId, dataIn.appId, dataIn.orgId, dataIn.applicationDocTypeId)) { return value; }
  }
};

module.exports = {
  ApplicationDocType,
  create,
  get,
  getById,
  validate,
  del,
  update,
};

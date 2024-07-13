const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { UserFamily } = require("./UserFamily");

class ApplicationParent extends Model {}
ApplicationParent.init({
  applicationParentsId: {
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
  relationship: {
    type: DataTypes.STRING,
  },
  lastUpdatedDateTime: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: "ApplicationParent",
  tableName: "applicationParents",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

ApplicationParent.belongsTo(UserFamily, {
  foreignKey: "userFamilyId",
});

const joiSchema = JOI.object().keys({
  applicationParentsId: JOI.string(),
  applicationId: JOI.string().required(),
  userFamilyId: JOI.string(),
  relationship: JOI.string(),
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
  modelData = ApplicationParent.build(dataIn);
  return modelData.save();
};

const get = async (applicationId) => ApplicationParent.findAll({ where: {
  applicationId,
},
include: [
  { model: UserFamily },
] });
const getById = async (id) => ApplicationParent.findByPk(id);

const del = async (id) => {
  const applicationParent = await ApplicationParent.findByPk(id);
  await applicationParent.destroy();
};

const update = async (dataIn) => {
  const data = await getById(dataIn.applicationParentsId);
  // only sendUserMessageEmail is allowed to be changed as per business rules
  data.userFamilyId = dataIn.userFamilyId ? dataIn.userFamilyId : data.userFamilyId;
  data.relationship = dataIn.relationship ? dataIn.relationship : data.relationship;
  return data.save();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.applicationParentsId = id; }
  if (dataIn.relationship == "") { delete dataIn.relationship; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    const ap = ApplicationParent.findAll({
      where: { applicationId: dataIn.applicationId, userFamilyId: dataIn.userFamilyId },
    });
    if (ap && ap.length > 0) {
      throw new Error("Application Parent record for given application/ user Family member already Exists!");
    }

    return value;
  }
};

module.exports = {
  ApplicationParent,
  create,
  get,
  getById,
  validate,
  del,
  update,
};

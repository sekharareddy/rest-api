const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class PageRole extends Model {}
PageRole.init({
  pageRoleId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  pageId: {
    type: DataTypes.UUID,
  },
  roleId: {
    type: DataTypes.UUID,
  },
  tenantId: {
    type: DataTypes.UUID,
  },
  appId: {
    type: DataTypes.UUID,
  },
  accessLevel: {
    type: DataTypes.NUMBER,
  },
  lastUpdatedDateTime: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: "PageRole",
  tableName: "pageRoles",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  pageRoleId: JOI.string(),
  pageId: JOI.string().required(),
  roleId: JOI.string().required(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  accessLevel: JOI.number(),
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
  modelData = PageRole.build(dataIn);
  // console.log('pageRole:', modelData);
  return modelData.save();
};

const get = async (tenantId, appId) => PageRole.findAll({ where: {
  tenantId,
  appId,
} });
const getPageRoles = async (tenantId, appId) => PageRole.findAll({
  where: { tenantId, appId },
  include: [
    {
      model: Role,
      attributes: ["roleName", "roleId"],
      as: "roles",
    },
  ],
  attributes: ["pageId", "roleId", "accessLevel"],
});
const getById = async (id) => PageRole.findByPk(id);

const del = async (pageRoleId) => {
  await PageRole.findByPk(pageRoleId)
    .then(async (pageRole) => {
      await pageRole.destroy();
    })
    .catch((err) => {
      console.log(err);
    });
};

const update = async (dataIn) => {
  const data = await getById(dataIn.pageRoleId);
  // only accessLevel is allowed to be changed as per business rules
  data.accessLevel = dataIn.accessLevel ? dataIn.accessLevel : data.accessLevel;
  return data.save();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.pageRoleId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    return value;
  }
};

module.exports = {
  PageRole,
  create,
  get,
  getPageRoles,
  getById,
  validate,
  del,
  update,
};

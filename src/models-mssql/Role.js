const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class Role extends Model { }

Role.init({
  roleId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  roleName: {
    type: DataTypes.STRING,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: "Role",
  tableName: "roles",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  roleId: JOI.string(),
  roleName: JOI.string(),
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
  modelData = AppUser.build(dataIn);
  await modelData.save();
};
const get = async () => await Role.findAll({});
const getById = async (id) => await Role.findByPk(id);

const update = async (dataIn) => {
  const data = await getById(dataIn.roleId);
  data.roleName = dataIn.roleName ? dataIn.roleName : data.roleName;
  return await data.save();
};
const del = async (roleId) => {
  const role = await Role.findByPk(roleId);
  await role.destroy();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.roleId = id; }

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
  Role,
  create,
  update,
  get,
  getById,
  validate,
  del,
};

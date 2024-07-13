const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const logger = require("../utils/logger")(module);

// const { AppElement } = require('./AppElement');

class Tenant extends Model {}

Tenant.init(
  {
    tenantId: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    tenantName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
    },
    lastModifiedBy: {
      type: DataTypes.UUID,
    },
    createdDateTime: {
      type: DataTypes.DATE,
    },
    lastUpdateDateTime: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Tenant",
    tableName: "Tenants",
    schema: "dbo",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  },
);

const joiSchema = JOI.object().keys({
  tenantId: JOI.string(),
  tenantName: JOI.string().required(),
  lastUpdateDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

// Tenant.hasMany(App,{
//   foreignKey:'tenantId',
//   as:'rowFormData'
// });

const create = async (obj) => {
  logger.info("Creating new org");
  const o = Tenant.build(obj);
  return await o.save();
};

const getById = async (id) => await Tenant.findByPk(id);
const update = async (dataIn) => {
  const data = await getById(dataIn.tenantId);
  // only appName is allowed to be changed, tenantId is not allowed to change as per business rules
  data.tenantName = dataIn.tenantName ? dataIn.tenantName : data.tenantName;
  return await data.save();
};
const del = async (id) => await Tenant.destroy({ where: { tenantId: id } });

const get = async (tenantId) => await Tenant.findAll({ where: { tenantId } });
const validate = async (dataIn, id = null) => {
  if (id != null) {
    dataIn.tenantId = id;
  }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets

    return value;
    // return generate(value);
  }
};

module.exports = {
  Tenant,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

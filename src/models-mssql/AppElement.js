const { Sequelize, DataTypes, Model, DATE, QueryTypes } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

const { AppElementProperty } = require("./AppElementProperty");
const createAEP = require("./AppElementProperty").create;

class AppElement extends Model {}

AppElement.init(
  {
    appElementId: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    appId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    appElementName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentAppElementId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    elementTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    appElementDisplayOrder: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    lastUpdateDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "AppElement",
    tableName: "AppElements",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  },
);

const joiSchema = JOI.object().keys({
  appElementId: JOI.string(),
  appId: JOI.string().required(),
  tenantId: JOI.string().required(),
  appElementName: JOI.string().required(),
  // parentAppElementId: JOI.string(),
  elementTypeId: JOI.string().required(),
  isVisible: JOI.boolean(),
  appElementDisplayOrder: JOI.number(),
  lastUpdateDateTime: JOI.date(),
  rowFormData: JOI.array(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

AppElement.hasMany(AppElementProperty, {
  foreignKey: "appElementId",
  as: "rowFormData",
});

const create = async (dataIn) => {
  // let rowFormData = dataIn.rowFormData?dataIn.rowFormData:null;
  delete dataIn.rowFormData;
  let modelData = AppElement.build(dataIn);
  const { appElementId } = modelData.dataValues;
  await modelData.save();

  const appElementProperties = await sequelize.query(
    "select * from crm.elementTypeProperties where elementTypeId = ?",
    {
      replacements: [dataIn.elementTypeId],
      type: QueryTypes.SELECT,
    },
  );

  appElementProperties.forEach(async (appElementProperty) => {
    await createAEP({
      tenantId: dataIn.tenantId,
      appId: dataIn.appId,
      appElementId,
      elementTypePropertyId: appElementProperty.elementTypePropertyId,
      appElementPropertyValue:
				appElementProperty.elementTypePropertyDefaultValue,
    });
  });
  modelData = await getById(modelData.dataValues.appElementId);
  return modelData;
};

const getById = async (id) => {
  const data = await AppElement.findOne({ where: { appElementId: id } });
  return data;
};

const update = async (dataIn) => {
  const data = await getById(dataIn.appElementId);
  // // change allowed columns if they are in incoming change dataset,  as per business rules
  data.appElementName = dataIn.hasOwnProperty("appElementName")
    ? dataIn.appElementName
    : data.appElementName;
  data.parentAppElementId = dataIn.hasOwnProperty("parentAppElementId")
    ? dataIn.parentAppElementId
    : data.parentAppElementId;
  data.elementTypeId = dataIn.hasOwnProperty("elementTypeId")
    ? dataIn.elementTypeId
    : data.elementTypeId;
  data.isVisible = dataIn.hasOwnProperty("isVisible") ? dataIn.isVisible : data.isVisible;
  data.lastModifiedBy = dataIn.hasOwnProperty("lastModifiedBy")
    ? dataIn.lastModifiedBy
    : data.lastModifiedBy;
  data.appElementDisplayOrder = dataIn.hasOwnProperty("appElementDisplayOrder")
    ? dataIn.appElementDisplayOrder
    : data.appElementDisplayOrder;
  data.lastUpdateDateTime = dataIn.hasOwnProperty("lastUpdateDateTime")
    ? dataIn.lastUpdateDateTime
    : data.lastUpdateDateTime;
  return await data.save();
};

const get = async (appId) => await AppElement.findAll({
  where: { appId },
  include: [
    {
      model: AppElementProperty,
      as: "rowFormData",
    },
  ],
});

const del = async (id) => await AppElement.destroy({ where: { appElementId: id } });

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.appElementId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
  } else {
    // validate foreign keys and any other business requiremets
    // const app = await getAppById(value.appId);
    // if (app==null) throw `appId can not be null!`;

    return value;
    // return generate(value);
  }
};

// const generate = (dataIn) => {
//   return dataIn;
// }

module.exports = {
  AppElement,
  create,
  update,
  get,
  del,
  validate,
};

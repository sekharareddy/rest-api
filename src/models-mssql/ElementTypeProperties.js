const { Sequelize, DataTypes, Model, QueryTypes } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const insertPageElementProperty = require("./PageElementProperty").create;
const insertAppElementProperty = require("./AppElementProperty").create;

class ElementTypeProperty extends Model {}

ElementTypeProperty.init({
  elementTypePropertyId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  elementTypeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  elementTypePropertyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  elementTypePropertyDataType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  elementTypePropertyRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  elementTypePropertyDefaultValue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  elementTypePropertyOrder: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  isAdvanced: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  lastUpdateDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "ElementTypeProperty",
  tableName: "elementTypeProperties",
  schema: "crm",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const create = async (dataIn, tenantId = null, appId = null) => {
  // const modelData = ElementTypeProperty.build(dataIn);
  const modelData = await ElementTypeProperty.create(dataIn);
  console.log(modelData.elementTypePropertyId);
  const { elementTypeId } = modelData;
  const pageElements = await sequelize.query(
    "select * from pageElements where tenantId = ? and appId = ? and elementTypeId = ? ",
    {
      replacements: [tenantId, appId, elementTypeId],
      type: QueryTypes.SELECT,
    },
  );
  console.log(`pageElements.length: ${pageElements.length}`);
  if (pageElements.length > 0) {
    pageElements.forEach(async (pageElement) => {
      await insertPageElementProperty({
        tenantId: pageElement.tenantId,
        appId: pageElement.appId,
        pageId: pageElement.pageId,
        pageElementId: pageElement.pageElementId,
        elementTypePropertyId: modelData.elementTypePropertyId,
        pageElementPropertyValue: modelData.elementTypePropertyDefaultValue,
      });
    });
  }
  const appElements = await sequelize.query(
    "select * from appElements where tenantId = ? and appId = ? and elementTypeId = ? ",
    {
      replacements: [tenantId, appId, elementTypeId],
      type: QueryTypes.SELECT,
    },
  );
  console.log(`appElements.length: ${appElements.length}`);
  if (appElements.length > 0) {
    appElements.forEach(async (appElement) => {
      await insertAppElementProperty({
        tenantId: appElement.tenantId,
        appId: appElement.appId,
        appElementId: appElement.appElementId,
        elementTypePropertyId: modelData.elementTypePropertyId,
        appElementPropertyValue: modelData.elementTypePropertyDefaultValue,
      });
    });
  }

  return modelData;
};

const getById = async (id) => {
  const data = await ElementTypeProperty.findOne({ where: { elementTypePropertyId: id } });
  return data;
};

const get = async (elementTypeId = null) => {
  const data = await ElementTypeProperty.findAll({ where: { elementTypeId } });
  return data;
};

const update = async (dataIn) => {
  const data = await getById(dataIn.elementTypePropertyId);

  data.elementTypePropertyName = dataIn.hasOwnProperty("elementTypePropertyName") ? dataIn.elementTypePropertyName : data.elementTypePropertyName;
  data.elementTypePropertyDataType = dataIn.hasOwnProperty("elementTypePropertyDataType") ? dataIn.elementTypePropertyDataType : data.elementTypePropertyDataType;
  data.elementTypePropertyRequired = dataIn.hasOwnProperty("elementTypePropertyRequired") ? dataIn.elementTypePropertyRequired : data.elementTypePropertyRequired;
  data.elementTypePropertyDefaultValue = dataIn.hasOwnProperty("elementTypePropertyDefaultValue") ? dataIn.elementTypePropertyDefaultValue : data.elementTypePropertyDefaultValue;
  data.elementTypePropertyOrder = dataIn.hasOwnProperty("elementTypePropertyOrder") ? dataIn.elementTypePropertyOrder : data.elementTypePropertyOrder;
  data.isAdvanced = dataIn.hasOwnProperty("isAdvanced") ? dataIn.isAdvanced : data.isAdvanced;

  return await data.save();
};

const del = async (id) => await ElementTypeProperty.destroy({ where: { elementTypePropertyId: id } });

module.exports = {
  ElementTypeProperty,
  create,
  update,
  get,
  getById,
  del,
};

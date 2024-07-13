const { Sequelize, DataTypes, Model, DATE, QueryTypes } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

const { PageElementProperty } = require("./PageElementProperty");
const createChildRecord = require("./PageElementProperty").create;

class PageElement extends Model {}

PageElement.init({
  pageElementId: {
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
  pageId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  pageElementName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parentPageElementId: {
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
  isExpanded: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  pageElementDisplayOrder: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  publishStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastUpdateDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "PageElement",
  tableName: "PageElements",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  pageElementId: JOI.string(),
  pageId: JOI.string().required(),
  appId: JOI.string().required(),
  tenantId: JOI.string().required(),
  pageElementName: JOI.string().required(),
  parentPageElementId: JOI.string(),
  elementTypeId: JOI.string().required(),
  isVisible: JOI.boolean(),
  pageElementDisplayOrder: JOI.number(),
  publishStatus: JOI.string(),
  lastUpdateDateTime: JOI.date(),
  rowFormData: JOI.array(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

PageElement.hasMany(PageElementProperty, {
  foreignKey: "pageElementId",
  as: "rowFormData",
});

const create = async (dataIn) => {
  delete dataIn.rowFormData;
  let modelData = PageElement.build(dataIn);
  const { pageElementId } = modelData.dataValues;
  await modelData.save();

  console.log(`dataIn.pageElementDisplayOrder: ${dataIn.pageElementDisplayOrder}, ${modelData.dataValues.pageElementDisplayOrder}`);
  await sequelize.query(
    "Exec updatePageElementDisplayOrder :pageId, :parentPageElementId, :pageElementId, :pageElementDisplayOrder",
    { replacements: { pageId: [dataIn.pageId],
      parentPageElementId: [dataIn.parentPageElementId],
      pageElementId: [pageElementId],
      pageElementDisplayOrder: [dataIn.pageElementDisplayOrder] } },
  );
  console.log({ elementTypeId: dataIn.elementTypeId });
  const pageElementProperties = await sequelize.query(
    "select * from crm.elementTypeProperties where elementTypeId = ?",
    {
      replacements: [dataIn.elementTypeId],
      type: QueryTypes.SELECT,
    },
  );

  pageElementProperties.forEach(async (pageElementProperty) => {
    console.log({ pageElementPropertyName: pageElementProperty.ElementTypePropertyName });
    await createChildRecord({
      tenantId: dataIn.tenantId,
      appId: dataIn.appId,
      pageId: dataIn.pageId,
      pageElementId,
      elementTypePropertyId: pageElementProperty.elementTypePropertyId,
      pageElementPropertyValue: pageElementProperty.elementTypePropertyDefaultValue,
      publishStatus: "PREVIEW",
    });
  });
  modelData = await getById(modelData.dataValues.pageElementId);
  return modelData;
};

const getById = async (id) => {
  const data = await PageElement.findOne({ where: { pageElementId: id },
    include: [{
      model: PageElementProperty,
      as: "rowFormData",
    }] });
  return data;
};

const update = async (dataIn) => {
  const data = await getById(dataIn.pageElementId);
  // // change allowed columns if they are in incoming change dataset,  as per business rules
  data.pageElementName = dataIn.hasOwnProperty("pageElementName") ? dataIn.pageElementName : data.pageElementName;
  data.parentPageElementId = dataIn.hasOwnProperty("parentPageElementId") ? dataIn.parentPageElementId : data.parentPageElementId;
  data.elementTypeId = dataIn.hasOwnProperty("elementTypeId") ? dataIn.elementTypeId : data.elementTypeId;
  data.isVisible = dataIn.hasOwnProperty("isVisible") ? dataIn.isVisible : data.isVisible;
  data.isExpanded = dataIn.hasOwnProperty("isExpanded") ? dataIn.isExpanded : data.isExpanded;
  data.pageElementDisplayOrder = dataIn.hasOwnProperty("pageElementDisplayOrder") ? dataIn.pageElementDisplayOrder : data.pageElementDisplayOrder;
  data.publishStatus = dataIn.hasOwnProperty("publishStatus") ? dataIn.publishStatus : data.publishStatus;
  data.lastUpdateDateTime = dataIn.hasOwnProperty("lastUpdateDateTime") ? dataIn.lastUpdateDateTime : data.lastUpdateDateTime;
  const response = await data.save();

  if (dataIn.hasOwnProperty("pageElementDisplayOrder")) {
    await sequelize.query(
      "Exec updatePageElementDisplayOrder :pageId, :parentPageElementId, :pageElementId, :pageElementDisplayOrder",
      { replacements: { pageId: [dataIn.pageId],
        parentPageElementId: [dataIn.parentPageElementId],
        pageElementId: [dataIn.pageElementId],
        pageElementDisplayOrder: [dataIn.pageElementDisplayOrder] } },
    );
  }
  return response;
};

const get = async (pageId) => await PageElement.findAll({ where: { pageId },
  include: [{
    model: PageElementProperty,
    as: "rowFormData",
  }],
});

const del = async (id) => await PageElement.destroy({ where: { pageElementId: id } });

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.pageElementId = id; }
  // console.log(dataIn);
  if (dataIn.parentPageElementId && dataIn.parentPageElementId.length < 5) {
    console.log(`dataIn.parentPageElementId: ${dataIn.parentPageElementId}  ${dataIn.parentPageElementId.length}`);
    dataIn.parentPageElementId = null;
  } else if (!dataIn.parentPageElementId) {
    console.log("dataIn.parentPageElementId: ", dataIn.parentPageElementId);
    let unDefined1;
    dataIn.parentPageElementId = unDefined1;
  }
  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
  } else {
    // validate foreign keys and any other business requiremets
    // const app = await getAppById(value.appId);
    // if (app==null) throw `appId can not be null!`;

    // need to be fixed later
    value.parentPageElementId = value.parentPageElementId === "" ? null : value.parentPageElementId;
    return value;
    // return generate(value);
  }
};

// const generate = (dataIn) => {
//   return dataIn;
// }

module.exports = {
  PageElement,
  create,
  update,
  get,
  getById,
  validate,
  del,
};

const { Sequelize, DataTypes, Model, DATE } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const apps = require('./Apps');

class PageElementProperty extends Model { }

PageElementProperty.init({
  pageElementPropertyId: {
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
  pageElementId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  elementTypePropertyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  pageElementPropertyValue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // elementTypePropertyName:{
  //   type: DataTypes.STRING ,
  //   allowNull: true
  // },
  // elementTypePropertyDataType:{
  //   type: DataTypes.STRING ,
  //   allowNull: true
  // },
  // elementTypePropertyOrder:{
  //   type: DataTypes.NUMBER ,
  //   allowNull: true
  // },
  // elementTypePropertyRequired:{
  //   type: DataTypes.BOOLEAN ,
  //   allowNull: true
  // },
  lastUpdateDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "PageElementProperty",
  tableName: "vw_PageElementProperties",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  pageElementPropertyId: JOI.string(),
  pageElementId: JOI.string(),
  pageId: JOI.string().required(),
  appId: JOI.string().required(),
  tenantId: JOI.string().required(),
  pageElementPropertyValue: JOI.string(),
  elementTypePropertyId: JOI.string().required(),
  lastUpdateDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

// App.hasMany(PageElementProperty,{
//   foreignKey:'appElementId',
//   as:'rowFormData'
// });

const create = async (dataIn) => {
  // console.log({dataIn});
  let modelData = PageElementProperty.build(dataIn);
  // console.log({modelData});
  modelData = await modelData.save();

  return modelData;
};

const getById = async (id) => {
  const data = await PageElementProperty.findOne({ where: { pageElementPropertyId: id } });
  return data;
};

const update = async (dataIn) => {
  const data = await getById(dataIn.pageElementPropertyId);
  if (data) {
    // // change allowed columns if they are in incoming change dataset,  as per business rules
    // console.log("PageElementProperty: ",data)
    data.pageElementPropertyValue = dataIn.hasOwnProperty("pageElementPropertyValue") ? dataIn.pageElementPropertyValue : data.pageElementPropertyValue;
    data.lastModifiedBy = dataIn.hasOwnProperty("lastModifiedBy") ? dataIn.lastModifiedBy : data.lastModifiedBy;
    return await data.save();
  }
};

const get = async (pageElementId) => await PageElementProperty.findAll({ where: { pageElementId } });

const del = async (pageElementId) => {
  const pageEle = await Page.findByPk(pageElementId);
  await pageEle.destroy();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.pageElementPropertyId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
  } else {
    // // validate foreign keys and any other business requiremets
    // const appelement = await AppElement.getById(value.appElementId);
    // if (appElement==null) throw `appelementId can not be null!`;

    return value;
    // return generate(value);
  }
};

// const generate = (dataIn) => {
//   return dataIn;
// }

module.exports = {
  PageElementProperty,
  create,
  update,
  getById,
  get,
  validate,
  del,
};

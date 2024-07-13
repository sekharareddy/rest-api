const { Sequelize, DataTypes, Model, DATE } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const apps = require('./Apps');

class AppElementPropertyView extends Model {}

AppElementPropertyView.init({
  appElementPropertyId: {
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
  appElementId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  elementTypePropertyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  appElementPropertyValue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  elementTypePropertyName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  elementTypePropertyDataType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  elementTypePropertyOrder: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  elementTypePropertyRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  lastUpdateDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "AppElementProperty",
  tableName: "vw_appElementProperties",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

/*
create view [dbo].[vw_appElementProperties]
with schemabinding
as
	select aep.tenantId, aep.appId, aep.appElementId, aep.appElementPropertyId, aep.elementTypePropertyId, aep.appElementPropertyValue, aep.lastUpdateDateTime
	, etp.elementTypePropertyName, etp.elementTypePropertyDataType, etp.elementTypePropertyOrder, etp.elementTypePropertyRequired
	from dbo.appElementProperties aep join crm.elementTypeProperties etp on aep.elementTypePropertyId = etp.elementTypePropertyId
GO

*/

class AppElementProperty extends Model {}

AppElementProperty.init({
  appElementPropertyId: {
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
  appElementId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  elementTypePropertyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  appElementPropertyValue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastUpdateDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "AppElementProperty",
  tableName: "appElementProperties",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  appElementPropertyId: JOI.string(),
  appElementId: JOI.string(),
  appId: JOI.string().required(),
  tenantId: JOI.string().required(),
  appElementPropertyValue: JOI.string(),
  elementTypePropertyId: JOI.string().required(),
  lastUpdateDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

// App.hasMany(AppElementProperty,{
//   foreignKey:'appElementId',
//   as:'rowFormData'
// });

const create = async (dataIn) => {
  let modelData = AppElementProperty.build(dataIn);
  modelData = await modelData.save();

  return modelData;
};

const getById = async (id) => {
  const data = await AppElementPropertyView.findOne({ where: { appElementPropertyId: id } });
  return data;
};

const update = async (dataIn) => {
  const data = await getById(dataIn.appElementPropertyId);
  console.log(dataIn, data);
  // // change allowed columns if they are in incoming change dataset,  as per business rules
  data.appElementPropertyValue = dataIn.appElementPropertyValue ? dataIn.appElementPropertyValue : data.appElementPropertyValue;
  data.lastModifiedBy = dataIn.lastModifiedBy ? dataIn.lastModifiedBy : data.lastModifiedBy;
  // data.appElementPropertyValue = dataIn.hasOwnProperty('appElementPropertyValue')?dataIn.appElementPropertyValue:data.appElementPropertyValue;
  // data.lastModifiedBy = dataIn.hasOwnProperty('lastModifiedBy')?dataIn.lastModifiedBy:data.lastModifiedBy;
  return await data.save();
};

const get = async (appElementId) => await AppElementPropertyView.findAll({ where: { appElementId } });

const del = async () => {
  const app = await AppElementProperty.findByPk(appElementId);
  await app.destroy();
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.appElementPropertyId = id; }

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
  AppElementProperty,
  create,
  update,
  get,
  validate,
  del,
};

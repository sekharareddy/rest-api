const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

const { AppElement } = require("./AppElement");
const createAE = require("./AppElement").create;
const { Tenant } = require("./Tenant");
const { ElementType } = require("./ElementTypes");

class App extends Model {}

App.init({
  appId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  appName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastUpdateDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "App",
  tableName: "Apps",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  appId: JOI.string(),
  tenantId: JOI.string().required(),
  appName: JOI.string().required(),
  lastUpdateDateTime: JOI.date(),
  rowFormData: JOI.array(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

App.hasMany(AppElement, {
  foreignKey: "appId",
  as: "rowFormData",
});
App.belongsTo(Tenant, {
  foreignKey: "tenantId",
});

const create = async (dataIn) => {
  let modelData;
  // let rowFormData = dataIn.rowFormData?dataIn.rowFormData:null;
  delete dataIn.rowFormData;
  modelData = App.build(dataIn);
  const { appId } = modelData;
  await modelData.save();

  const appElements = await ElementType.findAll({ where: { defaultParentLevel: "APP" } });
  // let appElement = appElements[0];

  // appElement = await createAE({
  //   "tenantId":dataIn.tenantId,
  //   "appId": appId,
  //   "appElementName": appElement.elementTypeName,
  //   "elementTypeId": appElement.elementTypeId,
  //   "appElementDisplayOrder":0,
  //   "isVisible":1
  // });
  // modelData.dataValues.rowFormData = [appElement];
  const rowFormData = [];
  await appElements.forEach(async (appElement) => {
    appElement = await createAE({
      tenantId: dataIn.tenantId,
      appId,
      appElementName: appElement.elementTypeName,
      elementTypeId: appElement.elementTypeId,
      appElementDisplayOrder: 0,
      isVisible: 1,
    });
    console.log("appElement added ", appElement);
    rowFormData.push(appElement);
    console.log("rowFormData ", rowFormData.length);
  });
  console.log("rowFormData ", rowFormData.length);

  modelData.dataValues.rowFormData = rowFormData;
  return modelData;
};

const getById = async (tenantId, id) => App.findAll({
  where: { tenantId, appId: id },
  include: [{
    model: AppElement,
    as: "rowFormData",
  }, {
    model: Tenant,
  },
  ],
});

const getByTenantId = async (tenantId, appId) => App.findOne({
  where: { tenantId, appId },
});

const update = async (dataIn) => new Promise(async (resolve, reject) => {
  const data = await getById(dataIn.tenantId, dataIn.appId);
  if (!data) {
    reject("App not found!");
  } else {
    // only appName is allowed to be changed, tenantId is not allowed to change as per business rules
    data.appName = dataIn.appName ? dataIn.appName : data.appName;
    resolve(await data.save());
  }
});

const get = async (tenantId) => await App.findAll({ where: { tenantId },
  include: [{
    model: AppElement,
    as: "rowFormData",
  }, {
    model: Tenant,
  }],
});

const del = async (appId) => {
  const app = await App.findByPk(appId);
  await app.destroy();
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.appId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
  } else {
    // validate foreign keys and any other business requiremets
    const tenant = await Tenant.findOne({ where: { tenantId: value.tenantId } });
    if (tenant == null) { throw "tenantId can not be null!"; }

    return value;
    // return generate(value);
  }
};

module.exports = {
  App,
  create,
  update,
  get,
  getById,
  getByTenantId,
  validate,
  del,
};

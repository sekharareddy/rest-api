const { Sequelize, DataTypes, Model, DATE } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const { Tenant } = require('./Tenants');
const { PageElement } = require("./PageElement");
const { PageRole } = require("./PageRole");
// const { Page } = require('./Page');
const { Role } = require("./Role");

class Page extends Model { }

Page.init(
  {
    pageId: {
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
    pageName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVisible: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    isModal: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    exact: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    isDefault: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    isAuthenticated: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    routePath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pageTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    console: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    component: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiEndPointData: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiEndPointAddData: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiEndPointUpdateData: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiEndPointDeleteData: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiEndPointSchema: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    publishStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isSPA: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    isPrivate: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    isEnabled: {
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
    modelName: "Page",
    tableName: "Pages",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  },
);

class PageView extends Model { }

PageView.init(
  {
    pageId: {
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
    pageName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isModal: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    exact: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    isAuthenticated: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    routePath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pageTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    console: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    component: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiEndPointData: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiEndPointAddData: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiEndPointUpdateData: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiEndPointDeleteData: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiEndPointSchema: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    publishStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isSPA: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    childItems: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastUpdateDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "PageView",
    tableName: "vw_Pages",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  },
);

const joiSchema = JOI.object().keys({
  appId: JOI.string(),
  pageId: JOI.string(),
  tenantId: JOI.string().required(),
  pageName: JOI.string().required(),
  isVisible: JOI.boolean(),
  isModal: JOI.boolean(),
  exact: JOI.boolean(),
  isDefault: JOI.boolean(),
  displayOrder: JOI.number(),
  isAuthenticated: JOI.boolean(),
  routePath: JOI.string(),
  pageTitle: JOI.string(),
  // console: JOI.string().allow(null),
  component: JOI.string(),
  // apiURL: JOI.string().allow(null),
  // apiEndPointData: JOI.string().allow(null),
  // apiEndPointAddData: JOI.string().allow(null),
  // apiEndPointUpdateData: JOI.string().allow(null),
  // apiEndPointDeleteData: JOI.string().allow(null),
  apiEndPointSchema: JOI.string().allow(null),
  publishStatus: JOI.string(),
  isSPA: JOI.boolean(),
  isPrivate: JOI.boolean(),
  isEnabled: JOI.boolean(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

Page.hasMany(PageElement, {
  foreignKey: "pageId",
  as: "rowFormData",
});

PageView.belongsToMany(Role, {
  through: "PageRole",
  foreignKey: "pageId",
  as: "roles",
});

Role.belongsToMany(PageView, {
  through: "PageRole",
  foreignKey: "roleId",
  as: "roles",
});

PageView.hasMany(PageRole, {
  foreignKey: "pageId",
  as: "pageRoles",
});
const create = async (dataIn) => {
  let modelData = dataIn;
  // let rowFormData = dataIn.rowFormData?dataIn.rowFormData:null;
  delete modelData.rowFormData;
  modelData = Page.build(dataIn);
  modelData = await modelData.save();
  return modelData;
};

const getById = async (id) => {
  console.log(`GETTING BY ID::::${id}`);
  const data = await PageView.findOne({
    where: { pageId: id },
    include: [{ model: PageRole, as: "pageRoles" }],
  });
  return data;
};

const update = async (dataIn) => {
  console.log("in update ");
  const data = await getById(dataIn.pageId);

  data.pageName = dataIn.hasOwnProperty("pageName") ? dataIn.pageName : data.pageName;
  data.isVisible = dataIn.hasOwnProperty("isVisible") ? dataIn.isVisible : data.isVisible;
  data.isModal = dataIn.hasOwnProperty("isModal") ? dataIn.isModal : data.isModal;
  data.exact = dataIn.hasOwnProperty("exact") ? dataIn.exact : data.exact;
  data.isDefault = dataIn.hasOwnProperty("isDefault") ? dataIn.isDefault : data.isDefault;
  data.displayOrder = dataIn.hasOwnProperty("displayOrder")
    ? dataIn.displayOrder
    : data.displayOrder;
  data.isAuthenticated = dataIn.hasOwnProperty("isAuthenticated")
    ? dataIn.isAuthenticated
    : data.isAuthenticated;
  data.routePath = dataIn.hasOwnProperty("routePath") ? dataIn.routePath : data.routePath;
  data.pageTitle = dataIn.hasOwnProperty("pageTitle") ? dataIn.pageTitle : data.pageTitle;
  data.console = dataIn.hasOwnProperty("console") ? dataIn.console : data.console;
  data.component = dataIn.hasOwnProperty("component") ? dataIn.component : data.component;
  data.apiURL = dataIn.hasOwnProperty("apiURL") ? dataIn.apiURL : data.apiURL;
  data.apiEndPointData = dataIn.hasOwnProperty("apiEndPointData")
    ? dataIn.apiEndPointData
    : data.apiEndPointData;
  data.apiEndPointAddData = dataIn.hasOwnProperty("apiEndPointAddData")
    ? dataIn.apiEndPointAddData
    : data.apiEndPointAddData;
  data.apiEndPointUpdateData = dataIn.hasOwnProperty("apiEndPointUpdateData")
    ? dataIn.apiEndPointUpdateData
    : data.apiEndPointUpdateData;
  data.apiEndPointDeleteData = dataIn.hasOwnProperty("apiEndPointDeleteData")
    ? dataIn.apiEndPointDeleteData
    : data.apiEndPointDeleteData;
  data.apiEndPointSchema = dataIn.hasOwnProperty("apiEndPointSchema")
    ? dataIn.apiEndPointSchema
    : data.apiEndPointSchema;
  data.publishStatus = dataIn.hasOwnProperty("publishStatus")
    ? dataIn.publishStatus
    : data.publishStatus;
  data.lastUpdateDateTime = dataIn.hasOwnProperty("lastUpdateDateTime")
    ? dataIn.lastUpdateDateTime
    : data.lastUpdateDateTime;
  data.isSPA = dataIn.hasOwnProperty("isSPA") ? dataIn.isSPA : data.isSPA;
  data.isPrivate = dataIn.hasOwnProperty("isPrivate") ? dataIn.isPrivate : data.isPrivate;
  data.isEnabled = dataIn.hasOwnProperty("isEnabled") ? dataIn.isEnabled : data.isEnabled;

  return await data.save();
};

const get = async (qry) => {
  const { appId } = qry;
  const whereClause = { appId, isPrivate: 0 };
  if (qry.hasOwnProperty("isPrivate")) {
    whereClause.isPrivate = Boolean(qry.isPrivate);
  }
  const ret = await PageView.findAll({
    where: whereClause,
    include: [
      {
        model: Role,
        attributes: ["roleName", "roleId"],
        as: "roles",
      },
    ],
  });
  return ret;
};

const getPages = async (qry) => {
  const { appId } = qry;
  const whereClause = { appId, isPrivate: 0 };
  if (qry.hasOwnProperty("isPrivate")) {
    whereClause.isPrivate = Boolean(qry.isPrivate);
  }
  const ret = await PageView.findAll({
    where: whereClause,
    include: [
      {
        model: Role,
        attributes: ["roleName", "roleId"],
        as: "roles",
      },
    ],
    attributes: ["pageId", "pageName", "component"],
  });
  return ret;
};

const del = async (pageId) => {
  console.log("Deleting::::::::::::::::::::::::::::::");
  console.log(pageId);
  await Page.destroy({
    where: {
      pageId,
    },
  });
};

const validate = async (dataIn, qry, id = null) => {
  if (id != null) { dataIn.pageId = id; }
  dataIn.tenantId = qry.tenantId;
  dataIn.appId = qry.appId;
  if (dataIn.component === null) { delete dataIn.component; }
  if (dataIn.component === "") { dataIn.component = "Component"; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    console.log(dataIn, id);
    throw `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
  } else {
    // validate foreign keys and any other business requiremets
    // const tenant = await Tenant.findOne({where:{tenantId:value.tenantId}});
    // if (tenant==null) throw `tenantId can not be null!`;
    console.log("validation succeded");
    return value;
    // return generate(value);
  }
};

// const generate = (dataIn) => {
//   return dataIn;
// }

module.exports = {
  Page,
  create,
  update,
  get,
  getPages,
  getById,
  validate,
  del,
};

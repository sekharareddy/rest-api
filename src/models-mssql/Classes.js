const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const { AppElement } = require('./AppElement');

class Classes extends Model {
}

Classes.init({
  classId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  className: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  classShortName: {
    type: DataTypes.STRING,
  },
  classHeirarchyOrder: {
    type: DataTypes.NUMBER,
  },
  createdDateTime: {
    type: DataTypes.DATE,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
  },
  orgId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  appId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: "Classes",
  tableName: "classes",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  classId: JOI.string(),
  className: JOI.string().required(),
  classShortName: JOI.string().required(),
  classHeirarchyOrder: JOI.number().required(),
  lastUpdatedDateTime: JOI.date(),
  orgId: JOI.string().required(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (obj) => {
  console.log("Creating new class");
  const o = Classes.build(obj);
  return await o.save();
};

const getById = async (id) => await Classes.findByPk(id);
const update = async (dataIn) => {
  console.log("Classes Update: ", dataIn);
  const data = await getById(dataIn.classId);
  // only appName is allowed to be changed, classId is not allowed to change as per business rules
  data.className = dataIn.className ? dataIn.className : data.className;
  data.classShortName = dataIn.classShortName ? dataIn.classShortName : data.classShortName;
  data.classHeirarchyOrder = dataIn.classHeirarchyOrder ? dataIn.classHeirarchyOrder : data.classHeirarchyOrder;
  return await data.save();
};
const del = async (id) => await Classes.destroy({ where: { classId: id } });

const get = async (qry, user) => {
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Staff" || role.roleName == "Support Staff")
            && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId };

  return await Classes.findAll({ where: whereClause });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.classId = id; }

  console.log(dataIn);
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
  Classes,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

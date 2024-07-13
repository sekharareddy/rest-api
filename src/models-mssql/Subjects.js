const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const { AppElement } = require('./AppElement');

class Subjects extends Model {
}

Subjects.init({
  subjectId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  subjectName: {
    type: DataTypes.STRING,
  },
  subjectCode: {
    type: DataTypes.STRING,
  },
  subjectShortName: {
    type: DataTypes.STRING,
    allowNull: false,
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
  modelName: "Subjects",
  tableName: "subjects",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  subjectId: JOI.string(),
  subjectName: JOI.string().required(),
  subjectCode: JOI.string().required(),
  subjectShortName: JOI.string().required(),
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
  console.log("Creating new subject");
  const o = Subjects.build(obj);
  return await o.save();
};

const getById = async (id) => await Subjects.findByPk(id);
const update = async (dataIn) => {
  console.log("Subjects Update: ", dataIn);
  const data = await getById(dataIn.subjectId);
  // only appName is allowed to be changed, subjectId is not allowed to change as per business rules
  data.subjectId = dataIn.subjectId ? dataIn.subjectId : data.subjectId;
  data.subjectName = dataIn.subjectName ? dataIn.subjectName : data.subjectName;
  data.subjectCode = dataIn.subjectCode ? dataIn.subjectCode : data.subjectCode;
  data.subjectShortName = dataIn.subjectShortName ? dataIn.subjectShortName : data.subjectShortName;
  return await data.save();
};
const del = async (id) => await Subjects.destroy({ where: { subjectId: id } });

const get = async (id, qry, user) => {
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Staff" || role.roleName == "Support Staff")
            && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId };

  return await Subjects.findAll({ where: whereClause });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.subjectId = id; }

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
  Subjects,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

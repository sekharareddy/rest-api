const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const { AppElement } = require('./AppElement');

class ClassSections extends Model {
}

ClassSections.init({
  classSectionId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  syllabusCombinationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  classSectionName: {
    type: DataTypes.STRING,
  },
  classSectionShortName: {
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
  modelName: "ClassSections",
  tableName: "classSections",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  classSectionId: JOI.string(),
  syllabusCombinationId: JOI.string(),
  classId: JOI.string(),
  classSectionName: JOI.string().required(),
  classSectionShortName: JOI.string().required(),
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
  const o = ClassSections.build(obj);
  return await o.save();
};

const getById = async (id) => await ClassSections.findByPk(id);
const update = async (dataIn) => {
  console.log("ClassSections Update: ", dataIn);
  const data = await getById(dataIn.classSectionId);
  // only appName is allowed to be changed, classSectionId is not allowed to change as per business rules
  data.syllabusCombinationId = dataIn.syllabusCombinationId ? dataIn.syllabusCombinationId : data.syllabusCombinationId;
  data.classId = dataIn.classId ? dataIn.classId : data.classId;
  data.classSectionName = dataIn.classSectionName ? dataIn.classSectionName : data.classSectionName;
  data.classSectionShortName = dataIn.classSectionShortName ? dataIn.classSectionShortName : data.classSectionShortName;
  return await data.save();
};
const del = async (id) => await ClassSections.destroy({ where: { classSectionId: id } });

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

  return await ClassSections.findAll({ where: whereClause });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.classSectionId = id; }

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
  ClassSections,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

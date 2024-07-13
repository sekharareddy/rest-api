const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class SyllabusClassCombination extends Model {
}

SyllabusClassCombination.init({
  syllabusClassCombinationId: {
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
  modelName: "SyllabusClassCombination",
  tableName: "syllabusClassCombinations",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  syllabusClassCombinationId: JOI.string(),
  syllabusCombinationId: JOI.string(),
  classId: JOI.string().required(),
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
  const o = SyllabusClassCombination.build(obj);
  return await o.save();
};

const getById = async (id) => await SyllabusClassCombination.findByPk(id);
const update = async (dataIn) => {
  console.log("SyllabusCombination Update: ", dataIn);
  const data = await getById(dataIn.syllabusClassCombinationId);
  // only appName is allowed to be changed, syllabusClassCombinationId is not allowed to change as per business rules
  data.syllabusClassCombinationId = dataIn.syllabusClassCombinationId ? dataIn.syllabusClassCombinationId : data.syllabusClassCombinationId;
  data.syllabusCombinationId = dataIn.syllabusCombinationId ? dataIn.syllabusCombinationId : data.syllabusCombinationId;
  data.classId = dataIn.classId ? dataIn.classId : data.classId;
  return await data.save();
};
const del = async (id) => await SyllabusClassCombination.destroy({ where: { syllabusClassCombinationId: id } });

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

  const data = await SyllabusClassCombination.findAll({ where: whereClause });
  return data;
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.syllabusClassCombinationId = id; }

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
  SyllabusClassCombination,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

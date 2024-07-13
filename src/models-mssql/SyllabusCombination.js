const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

const { SyllabusCombinationSubject } = require("./SyllabusCombinationSubject");

class SyllabusCombination extends Model {
}

SyllabusCombination.init({
  syllabusCombinationId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  syllabusCombinationName: {
    type: DataTypes.STRING,
  },
  syllabusCombinationShortName: {
    type: DataTypes.STRING,
  },
  syllabusId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  teachingMediumId: {
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
  modelName: "SyllabusCombination",
  tableName: "syllabusCombinations",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

SyllabusCombination.hasMany(SyllabusCombinationSubject, {
  foreignKey: "syllabusCombinationId",
  as: "rowFormData",
});

const joiSchema = JOI.object().keys({
  syllabusCombinationId: JOI.string(),
  syllabusCombinationName: JOI.string().required(),
  syllabusCombinationShortName: JOI.string().required(),
  syllabusId: JOI.string().required(),
  teachingMediumId: JOI.string().required(),
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
  const o = SyllabusCombination.build(obj);
  return await o.save();
};

const getById = async (id) => await SyllabusCombination.findByPk(id);
const update = async (dataIn) => {
  console.log("SyllabusCombination Update: ", dataIn);
  const data = await getById(dataIn.syllabusCombinationId);
  // only appName is allowed to be changed, syllabusCombinationId is not allowed to change as per business rules
  data.syllabusCombinationId = dataIn.syllabusCombinationId ? dataIn.syllabusCombinationId : data.syllabusCombinationId;
  data.syllabusCombinationName = dataIn.syllabusCombinationName ? dataIn.syllabusCombinationName : data.syllabusCombinationName;
  data.syllabusCombinationShortName = dataIn.syllabusCombinationShortName ? dataIn.syllabusCombinationShortName : data.syllabusCombinationShortName;
  data.syllabusId = dataIn.syllabusId ? dataIn.syllabusId : data.syllabusId;
  data.teachingMediumId = dataIn.teachingMediumId ? dataIn.teachingMediumId : data.teachingMediumId;
  data.classId = dataIn.classId ? dataIn.classId : data.classId;
  return await data.save();
};
const del = async (id) => await SyllabusCombination.destroy({ where: { syllabusCombinationId: id } });

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
  return await SyllabusCombination.findAll({
    where: whereClause,
    include: [{
      model: SyllabusCombinationSubject,
      as: "rowFormData",
    }],
  });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.syllabusCombinationId = id; }

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
  SyllabusCombination,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

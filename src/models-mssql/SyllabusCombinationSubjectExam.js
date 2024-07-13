const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const { AppElement } = require('./AppElement');

class SyllabusCombinationSubjectExam extends Model {
}

SyllabusCombinationSubjectExam.init({
  syllabusCombinationSubjectExamId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  syllabusCombinationSubjectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  maxMarks: {
    type: DataTypes.NUMBER,
  },
  active: {
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
  modelName: "SyllabusCombinationSubjectExam",
  tableName: "syllabusCombinationSubjectExams",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  syllabusCombinationSubjectExamId: JOI.string(),
  syllabusCombinationSubjectId: JOI.string(),
  examId: JOI.string().required(),
  maxMarks: JOI.number(),
  active: JOI.number(),
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
  console.log("Creating new SyllabusCombinationSubjectExam");
  const o = SyllabusCombinationSubjectExam.build(obj);
  return await o.save();
};

const getById = async (id) => await SyllabusCombinationSubjectExam.findByPk(id);
const update = async (dataIn) => {
  console.log("SyllabusCombinationSubjectExam Update: ", dataIn);
  const data = await getById(dataIn.syllabusClassCombinationSubjectId);
  // only appName is allowed to be changed, syllabusClassCombinationId is not allowed to change as per business rules

  data.syllabusCombinationSubjectId = dataIn.syllabusCombinationSubjectId ? dataIn.syllabusCombinationSubjectId : data.syllabusCombinationSubjectId;
  data.examId = dataIn.examId ? dataIn.examId : data.examId;
  data.maxMarks = dataIn.maxMarks ? dataIn.maxMarks : data.maxMarks;
  data.active = dataIn.active ? dataIn.active : data.active;
  return await data.save();
};
const del = async (id) => await SyllabusCombinationSubjectExam.destroy({ where: { syllabusCombinationSubjectExamId: id } });

const get = async (qry, user) => {
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Staff" || role.roleName == "Support Staff")
            && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);
  if (!userHasStaffRole) {
    throw new Error("Insufficient Permissions");
  }

  const whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId };
  if (qry.syllabusCombinationSubjectId) {
    whereClause.syllabusCombinationSubjectId = qry.syllabusCombinationSubjectId;
  }
  return await SyllabusCombinationSubjectExam.findAll({ where: whereClause });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.syllabusCombinationSubjectExamId = id; }

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
  SyllabusCombinationSubjectExam,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

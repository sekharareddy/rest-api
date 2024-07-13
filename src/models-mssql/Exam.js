const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { SyllabusCombinationSubjectExam } = require("./SyllabusCombinationSubjectExam");

// const { AppElement } = require('./AppElement');

class Exam extends Model {
}

Exam.init({
  examId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  examGroupId: {
    type: DataTypes.UUID,
  },
  examName: {
    type: DataTypes.STRING,
  },
  examShortName: {
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
  modelName: "Exam",
  tableName: "exams",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  examId: JOI.string(),
  examGroupId: JOI.string(),
  examName: JOI.string().required(),
  examShortName: JOI.string().required(),
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

Exam.hasMany(SyllabusCombinationSubjectExam, {
  foreignKey: "examId",
  as: "examSubjects",
});

const create = async (obj) => {
  console.log("Creating new exam");
  const o = Exam.build(obj);
  return await o.save();
};

const getById = async (id) => await Exam.findByPk(id);
const update = async (dataIn) => {
  console.log("Exam Update: ", dataIn);
  const data = await getById(dataIn.examId);
  // only appName is allowed to be changed, examId is not allowed to change as per business rules
  data.examGroupId = dataIn.examGroupId ? dataIn.examGroupId : data.examGroupId;
  data.examName = dataIn.examName ? dataIn.examName : data.examName;
  data.subjectCode = dataIn.subjectCode ? dataIn.subjectCode : data.subjectCode;
  data.examShortName = dataIn.examShortName ? dataIn.examShortName : data.examShortName;
  return await data.save();
};
const del = async (id) => await Exam.destroy({ where: { examId: id } });

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
  if (qry.examGroupId) {
    whereClause.examGroupId = qry.examGroupId;
  }

  return await Exam.findAll({ where: whereClause,
    include: [{
      model: SyllabusCombinationSubjectExam,
      as: "examSubjects",
    }] });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.examId = id; }

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
  Exam,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

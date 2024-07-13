const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const { AppElement } = require('./AppElement');

class SyllabusCombinationSubjectExamSchedule extends Model {}

SyllabusCombinationSubjectExamSchedule.init(
  {
    syllabusCombinationSubjectExamScheduleId: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    syllabusCombinationSubjectExamId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    classSectionId: {
      type: DataTypes.UUID,
    },
    academicYearId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    examDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    examStartTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    examEndTime: {
      type: DataTypes.DATE,
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
    orgId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
    },
    lastUpdatedBy: {
      type: DataTypes.UUID,
    },
    createdDateTime: {
      type: DataTypes.DATE,
    },
    lastUpdatedDateTime: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "SyllabusCombinationSubjectExamSchedule",
    tableName: "syllabusCombinationSubjectExamSchedule",
    schema: "dbo",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  },
);

const joiSchema = JOI.object().keys({
  syllabusCombinationSubjectExamScheduleId: JOI.string(),
  syllabusCombinationSubjectExamId: JOI.string().required(),
  academicYearId: JOI.string().required(),
  classSectionId: JOI.string().required(),
  examDate: JOI.date().required(),
  examStartTime: JOI.date().allow(null),
  examEndTime: JOI.date().allow(null),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  orgId: JOI.string().required(),
  lastUpdatedDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

// Syllabus.hasMany(App,{
//   foreignKey:'syllabusId',
//   as:'rowFormData'
// });

const create = async (obj) => {
  console.log("Creating new syllabusCombinationSubjectExamSchedule");
  const o = SyllabusCombinationSubjectExamSchedule.build(obj);
  return await o.save();
};

const getById = async (id) => await SyllabusCombinationSubjectExamSchedule.findByPk(id);
const update = async (dataIn) => {
  console.log("syllabusCombinationSubjectExamSchedule Update", dataIn);
  const data = await getById(dataIn.syllabusCombinationSubjectExamScheduleId);
  // only appName is allowed to be changed, syllabusId is not allowed to change as per business rules
  data.syllabusCombinationSubjectExamId = dataIn.syllabusCombinationSubjectExamId
    ? dataIn.syllabusCombinationSubjectExamId
    : data.syllabusCombinationSubjectExamId;
  data.classSectionId = dataIn.classSectionId
    ? dataIn.classSectionId
    : data.classSectionId;
  data.academicYearId = dataIn.academicYearId
    ? dataIn.academicYearId
    : data.academicYearId;
  data.examDate = dataIn.examDate ? dataIn.examDate : data.examDate;
  data.examStartTime = dataIn.examStartTime
    ? dataIn.examStartTime
    : data.examStartTime;
  data.examEndTime = dataIn.examEndTime ? dataIn.examEndTime : data.examEndTime;
  return await data.save();
};
const del = async (id) => await SyllabusCombinationSubjectExamSchedule.destroy({
  where: { syllabusCombinationSubjectExamScheduleId: id },
});

const get = async (id, qry, user) => {
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if (
      (role.roleName == "Staff" || role.roleName == "Support Staff")
      && role.roleId == qry.roleId
    ) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = {
    tenantId: qry.tenantId,
    appId: qry.appId,
    orgId: qry.orgId,
  };
  if (qry.classSectionId) {
    whereClause.classSectionId = qry.classSectionId;
  }
  if (qry.acadenicYearId) {
    whereClause.acadenicYearId = qry.acadenicYearId;
  }
  return await SyllabusCombinationSubjectExamSchedule.findAll({
    where: whereClause,
  });
};
const validate = async (dataIn, qry, id = null) => {
  if (id != null) { dataIn.syllabusCombinationSubjectExamScheduleId = id; }

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
  SyllabusCombinationSubjectExamSchedule,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

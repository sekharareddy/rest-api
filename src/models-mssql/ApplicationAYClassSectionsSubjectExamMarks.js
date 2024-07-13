const { Sequelize, DataTypes, Model, Op } = require("sequelize");
const JOI = require("joi");
const dayjs = require("dayjs");
const sequelize = require("../utils/sequelize");

class ApplicationAYClassSectionsSubjectExamMarks extends Model {}

ApplicationAYClassSectionsSubjectExamMarks.init(
  {
    applicationAYClassSectionsSubjectExamMarksId: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    applicationAYClassSectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    classSectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    syllabusCombinationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    syllabusCombinationSubjectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    syllabusCombinationSubjectExamId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    examId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    examDate: {
      type: DataTypes.DATE,
    },
    marks: {
      type: DataTypes.NUMBER,
    },
    grade: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.STRING,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    verifiedBy: {
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
    modelName: "ApplicationAYClassSectionsSubjectExamMarks",
    tableName: "applicationAYClassSectionsSubjectExamMarks",
    schema: "dbo",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  },
);

const joiSchema = JOI.object().keys({
  applicationAYClassSectionsSubjectExamMarksId: JOI.string(),
  applicationAYClassSectionId: JOI.string().required(),
  classSectionId: JOI.string().required(),
  syllabusCombinationId: JOI.string().required(),
  syllabusCombinationSubjectId: JOI.string().required(),
  subjectId: JOI.string().required(),
  syllabusCombinationSubjectExamId: JOI.string().required(),
  examId: JOI.string().required(),
  examDate: JOI.date(),
  marks: JOI.string().allow(null),
  grade: JOI.string().allow(null),
  notes: JOI.string().allow(null),
  createdBy: JOI.string().required(),
  verifiedBy: JOI.string().allow(null),
  lastUpdatedDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (obj) => {
  console.log("Creating new ApplicationAYClassSectionsSubjectExamMarks");
  // if (!obj.ApplicationAYClassSectionRollNumber) {
  //     let maxRec = await ApplicationAYClassSection.findAll({
  //         where: {
  //             classSectionId: obj.classSectionId,
  //             academicYearId: obj.academicYearId,
  //             endDate: { [Op.eq]: null }
  //         },
  //         attributes: [
  //             [sequelize.fn('count', sequelize.col('applicationId')), 'totalApplications'],
  //             [sequelize.fn('max', sequelize.col('ApplicationAYClassSectionRollNumber')), 'maxApplicationAYClassSectionRollNumber']
  //         ]
  //     })
  //     let maxApplicationAYClassSectionRollNumber = 1;
  //     if (maxRec && maxRec[0]?.dataValues?.maxApplicationAYClassSectionRollNumber) {
  //         if (maxRec[0]?.dataValues?.maxApplicationAYClassSectionRollNumber >= maxRec[0]?.dataValues?.totalApplications)
  //             maxApplicationAYClassSectionRollNumber = maxRec[0]?.dataValues?.maxApplicationAYClassSectionRollNumber + 1;
  //         else
  //             maxApplicationAYClassSectionRollNumber = maxRec[0]?.dataValues?.totalApplications + 1
  //     }
  //     obj.ApplicationAYClassSectionRollNumber = maxApplicationAYClassSectionRollNumber;
  // }

  const o = ApplicationAYClassSectionsSubjectExamMarks.build(obj);
  return await o.save();
};

const getById = async (id) => await ApplicationAYClassSectionsSubjectExamMarks.findByPk(id);
const update = async (dataIn) => {
  console.log("ApplicationAYClassSectionsSubjectExamMarks Update: ", dataIn);
  const data = await getById(
    dataIn.applicationAYClassSectionsSubjectExamMarksId,
  );
  // only appName is allowed to be changed, applicationAYClassSectionId is not allowed to change as per business rules
  data.applicationAYClassSectionId = dataIn.applicationAYClassSectionId
    ? dataIn.applicationAYClassSectionId
    : data.applicationAYClassSectionId;
  data.classSectionId = dataIn.classSectionId
    ? dataIn.classSectionId
    : data.classSectionId;
  data.syllabusCombinationId = dataIn.syllabusCombinationId
    ? dataIn.syllabusCombinationId
    : data.syllabusCombinationId;
  data.syllabusCombinationSubjectId = dataIn.syllabusCombinationSubjectId
    ? dataIn.syllabusCombinationSubjectId
    : data.syllabusCombinationSubjectId;
  data.subjectId = dataIn.subjectId ? dataIn.subjectId : data.subjectId;
  data.syllabusCombinationSubjectExamId = dataIn.syllabusCombinationSubjectExamId
    ? dataIn.syllabusCombinationSubjectExamId
    : data.syllabusCombinationSubjectExamId;
  data.examId = dataIn.examId ? dataIn.examId : data.examId;
  data.examDate = dataIn.examDate ? dataIn.examDate : data.examDate;
  data.marks = dataIn.marks ? dataIn.marks : data.marks;
  data.grade = dataIn.grade ? dataIn.grade : data.grade;
  data.notes = dataIn.notes ? dataIn.notes : data.notes;
  data.createdBy = dataIn.createdBy ? dataIn.createdBy : data.createdBy;
  data.verifiedBy = dataIn.verifiedBy ? dataIn.verifiedBy : data.verifiedBy;
  return await data.save();
};

const del = async (id) => await ApplicationAYClassSectionsSubjectExamMarks.destroy({
  where: { applicationAYClassSectionsSubjectExamMarksId: id },
});

const get = async (qry, user) => {
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if (
      (role.roleName == "Staff" || role.roleName == "Support Staff")
      && role.roleId == qry.roleId
    ) {
      userHasStaffRole = true;
    }
  });
  console.log(`103: userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = {
    classSectionId: qry.classSectionId,
    examId: qry.examId,
    syllabusCombinationSubjectId: qry.syllabusCombinationSubjectId,
  }; // ,examDate:dayjs(qry.examDate).format('YYYY-MM-DD 00:00:00.0000000') }
  if (qry.examDate) {
    const tdt = new Date(qry.examDate);
    const d1 = dayjs(tdt).format("YYYY-MM-DD");
    const d2 = dayjs(tdt).add(1, "day").format("YYYY-MM-DD");
    whereClause.examDate = { [Op.between]: [d1, d2] };
  }
  return await ApplicationAYClassSectionsSubjectExamMarks.findAll({
    where: whereClause,
  });
};

const validate = async (dataIn, user, id = null) => {
  if (id != null) { dataIn.applicationAYClassSectionsSubjectExamMarksId = id; }
  dataIn.createdBy = user.userId;
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
  ApplicationAYClassSectionsSubjectExamMarks,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

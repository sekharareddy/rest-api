const { Sequelize, DataTypes, Model, Op } = require("sequelize");
const JOI = require("joi");
const dayjs = require("dayjs");
const sequelize = require("../utils/sequelize");

class ApplicationAYClassSectionsSubjectExamMarksReport extends Model {}

ApplicationAYClassSectionsSubjectExamMarksReport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userChildrenId: {
      type: DataTypes.UUID,
    },
    applicationId: {
      type: DataTypes.UUID,
    },
    academicYearId: {
      type: DataTypes.UUID,
    },
    academicYearName: {
      type: DataTypes.STRING,
    },
    userChildName: {
      type: DataTypes.STRING,
    },
    classSectionId: {
      type: DataTypes.UUID,
    },
    classSectionName: {
      type: DataTypes.STRING,
    },
    classSectionId: {
      type: DataTypes.UUID,
    },
    ApplicationAYClassSectionRollNumber: {
      type: DataTypes.NUMBER,
    },
    examGroupId: {
      type: DataTypes.UUID,
    },
    examGroupName: {
      type: DataTypes.STRING,
    },
    weightage: {
      type: DataTypes.NUMBER,
    },
    examGroupFullName: {
      type: DataTypes.STRING,
    },
    subjectId: {
      type: DataTypes.UUID,
    },
    subjectName: {
      type: DataTypes.STRING,
    },
    examId: {
      type: DataTypes.UUID,
    },
    examName: {
      type: DataTypes.STRING,
    },
    maxMarks: {
      type: DataTypes.NUMBER,
    },
    marks: {
      type: DataTypes.NUMBER,
    },
    grade: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "ApplicationAYClassSectionsSubjectExamMarksReport",
    tableName: "vw_aycsExamMarksReport",
    schema: "dbo",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  },
);

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
    tenantId: qry.tenantId,
    appId: qry.appId,
    orgId: qry.orgId,
    classSectionId: qry.classSectionId,
    academicYearId: qry.academicYearId,
  }; // ,examDate:dayjs(qry.examDate).format('YYYY-MM-DD 00:00:00.0000000') }
  return await ApplicationAYClassSectionsSubjectExamMarksReport.findAll({
    where: whereClause,
  });
};

module.exports = {
  ApplicationAYClassSectionsSubjectExamMarksReport,
  get,
};

const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

const { SyllabusCombinationSubjectExam } = require("./SyllabusCombinationSubjectExam");

class SyllabusCombinationSubject extends Model {
}

SyllabusCombinationSubject.init({
  syllabusCombinationSubjectId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  syllabusCombinationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  teachingMediumId: {
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
  modelName: "SyllabusCombinationSubject",
  tableName: "syllabusCombinationSubjects",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

class vwSyllabusCombinationSubject extends Model {
}

vwSyllabusCombinationSubject.init({
  syllabusCombinationSubjectId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  syllabusCombinationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  syllabusCombinationName: {
    type: DataTypes.STRING,
  },
  syllabusCombinationShortName: {
    type: DataTypes.STRING,
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  subjectName: {
    type: DataTypes.STRING,
  },
  subjectShortName: {
    type: DataTypes.STRING,
  },
  subjectCode: {
    type: DataTypes.STRING,
  },
  teachingMediumId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teachingMediumLanguage: {
    type: DataTypes.STRING,
  },
  teachingMediumLanguageCode1: {
    type: DataTypes.STRING,
  },
  teachingMediumLanguageCode2: {
    type: DataTypes.STRING,
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
    type: DataTypes.UUID,
    allowNull: false,
  },
  appId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: "vwSyllabusCombinationSubject",
  tableName: "vw_syllabusCombinationSubjects",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

vwSyllabusCombinationSubject.hasMany(SyllabusCombinationSubjectExam, {
  foreignKey: "syllabusCombinationSubjectId",
  as: "rowFormData",
});

const joiSchema = JOI.object().keys({
  syllabusCombinationSubjectId: JOI.string(),
  syllabusCombinationId: JOI.string(),
  subjectId: JOI.string().required(),
  lastUpdatedDateTime: JOI.date(),
  orgId: JOI.string().required(),
  teachingMediumId: JOI.string().required(),
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
  const o = SyllabusCombinationSubject.build(obj);
  return await o.save();
};

const getById = async (id) => await SyllabusCombinationSubject.findByPk(id);
const update = async (dataIn) => {
  console.log("SyllabusCombinationSubject Update: ", dataIn);
  const data = await getById(dataIn.syllabusClassCombinationSubjectId);
  // only appName is allowed to be changed, syllabusClassCombinationId is not allowed to change as per business rules

  data.syllabusCombinationId = dataIn.syllabusCombinationId ? dataIn.syllabusCombinationId : data.syllabusCombinationId;
  data.subjectId = dataIn.subjectId ? dataIn.subjectId : data.subjectId;
  data.teachingMediumId = dataIn.teachingMediumId ? dataIn.teachingMediumId : data.teachingMediumId;
  return await data.save();
};
const del = async (id) => await SyllabusCombinationSubject.destroy({ where: { syllabusCombinationSubjectId: id } });

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
  if (qry.syllabusCombinationId) {
    whereClause.syllabusCombinationId = syllabusCombinationId;
  }
  // return await SyllabusCombinationSubject.findAll({where: whereClause})
  return await vwSyllabusCombinationSubject.findAll({
    where: whereClause,
    order: [["syllabusCombinationId", "ASC"]],
    include: [{
      model: SyllabusCombinationSubjectExam,
      as: "rowFormData",
    }],
  });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.syllabusCombinationSubjectId = id; }

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
  SyllabusCombinationSubject,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

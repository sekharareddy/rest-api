const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

const { Exam } = require("./Exam");

class ExamGroup extends Model {
}

ExamGroup.init({
  examGroupId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  examGroupName: {
    type: DataTypes.STRING,
  },
  examGroupShortName: {
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
  modelName: "ExamGroup",
  tableName: "examGroups",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  examGroupId: JOI.string(),
  examGroupName: JOI.string().required(),
  examGroupShortName: JOI.string().required(),
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

ExamGroup.hasMany(Exam, {
  foreignKey: "examGroupId",
  as: "exams",
});

const create = async (obj) => {
  console.log("Creating new examGroup");
  const o = ExamGroup.build(obj);
  return await o.save();
};

const getById = async (id) => await ExamGroup.findByPk(id);
const update = async (dataIn) => {
  console.log("ExamGroup Update: ", dataIn);
  const data = await getById(dataIn.examGroupId);
  // only appName is allowed to be changed, examGroupId is not allowed to change as per business rules
  data.examGroupName = dataIn.examGroupName ? dataIn.examGroupName : data.examGroupName;
  data.examGroupShortName = dataIn.examGroupShortName ? dataIn.examGroupShortName : data.examGroupShortName;
  return await data.save();
};
const del = async (id) => await ExamGroup.destroy({ where: { examGroupId: id } });

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
  return await ExamGroup.findAll({
    where: whereClause,
    include: [
      {
        model: Exam,
        as: "exams",
      },
    ],
  });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.examGroupId = id; }

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
  ExamGroup,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

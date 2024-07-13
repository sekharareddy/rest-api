const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class ApplicationScholarships extends Model {
}

ApplicationScholarships.init({
  applicationScholarshipId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  requestedAmount: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  distributionFrequency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  scholarshipType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  approvedAmount: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  scholarshipReceiver: {
    type: DataTypes.STRING,
    allowNull: true,
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
  createdDateTime: {
    type: DataTypes.DATE,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: "ApplicationScholarships",
  tableName: "applicationScholarships",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  applicationScholarshipId: JOI.string(),
  applicationId: JOI.string().required(),
  requestedAmount: JOI.number().required(),
  distributionFrequency: JOI.string(),
  scholarshipType: JOI.string(),
  status: JOI.string().required(),
  approvedAmount: JOI.number().allow(null),
  scholarshipReceiver: JOI.string().allow(null).allow(""),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  orgId: JOI.string().required(),
});

// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (obj) => {
  console.log("Creating new applicationScholarship");
  const o = ApplicationScholarships.build(obj);
  return await o.save();
};

const getById = async (id) => await ApplicationScholarships.findByPk(id);
const update = async (dataIn) => {
  console.log("Application Scholarship Update: ", dataIn);
  const data = await getById(dataIn.applicationScholarshipId);
  // only appName is allowed to be changed, academicYearId is not allowed to change as per business rules
  data.applicationScholarshipId = dataIn.applicationScholarshipId ? dataIn.applicationScholarshipId : data.applicationScholarshipId;
  data.applicationId = dataIn.applicationId ? dataIn.applicationId : data.applicationId;
  data.requestedAmount = dataIn.requestedAmount ? dataIn.requestedAmount : data.requestedAmount;
  data.distributionFrequency = dataIn.distributionFrequency ? dataIn.distributionFrequency : data.distributionFrequency;
  data.scholarshipType = dataIn.scholarshipType ? dataIn.scholarshipType : data.scholarshipType;
  data.status = dataIn.status ? dataIn.status : data.status;
  data.approvedAmount = dataIn.approvedAmount ? dataIn.approvedAmount : data.approvedAmount;
  data.scholarshipReceiver = dataIn.scholarshipReceiver ? dataIn.scholarshipReceiver : data.scholarshipReceiver;
  return await data.save();
};
const del = async (id) => await ApplicationScholarships.destroy({ where: { applicationScholarshipId: id } });

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
  return await ApplicationScholarships.findAll({
    where: whereClause,
  });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.applicationScholarshipId = id; }

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
  ApplicationScholarships,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

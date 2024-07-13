const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { ApplicationParent } = require("./ApplicationParent");
const { ApplicationEmergencyContact } = require("./ApplicationEmergencyContact");
const { ApplicationPickupPermission } = require("./ApplicationPickupPermission");
const createApplicationPickupPermission = require("./ApplicationPickupPermission").create;
const { ApplicationAgreementDay } = require("./ApplicationAgreementDay");
const { ApplicationDocument } = require("./ApplicationDocument");
const { ApplicationAYClassSection } = require("./ApplicationAYClassSection");
const { ApplicationScholarships } = require("./ApplicationScholarship");
const { Organization } = require("./Organization");
const { UserChildren } = require("./UserChildren");
const { UserFamily, getSelf } = require("./UserFamily");
const appGetById = require("./App").getById;
const orgGetById = require("./Organization").getById;

const { gt, lte, ne, in: opIn } = Sequelize.Op;

class Application extends Model { }
Application.init({
  applicationId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  orgId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  applicationName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  applicationStatus: {
    type: DataTypes.STRING,
    defaultValue: "DRAFT",
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userChildrenId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  applicationNotes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  childEntryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  childExitDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  medicalCareProviderName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  medicalCareProviderAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  medicalCareProviderPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastPhysicalExam: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dentalCareProviderName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dentalCareProviderAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dentalCareProviderPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastDentalExam: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  childKnownHealthConditions: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  consentDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  fee: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  feeDueDate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feePeriod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sourceOfPayment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otRate: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  otPeriod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lateFee: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  lateFeePeriod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otherFee: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  otherFeeDescription: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  terminationText: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  advanceNotice: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  writtenNotice: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  licenseeAgreementDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  licenseeAgreementComments: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  applicationNumber: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  className: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  biometric_fp: {
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
  isDeleted: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: "Application",
  tableName: "applications",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  applicationId: JOI.string(),
  orgId: JOI.string().required(),
  applicationName: JOI.string().required(),
  applicationStatus: JOI.string(),
  userId: JOI.string().required(),
  userChildrenId: JOI.string(),
  applicationNotes: JOI.string(),
  childEntryDate: JOI.date(),
  childExitDate: JOI.date(),
  medicalCareProviderName: JOI.string(),
  medicalCareProviderAddress: JOI.string(),
  medicalCareProviderPhone: JOI.string(),
  lastPhysicalExam: JOI.string(),
  dentalCareProviderName: JOI.string(),
  dentalCareProviderAddress: JOI.string(),
  dentalCareProviderPhone: JOI.string(),
  lastDentalExam: JOI.string(),
  childKnownHealthConditions: JOI.string(),
  consentDate: JOI.date(),
  fee: JOI.number(),
  feeDueDate: JOI.string(),
  feePeriod: JOI.string(),
  sourceOfPayment: JOI.string(),
  otRate: JOI.number(),
  otPeriod: JOI.string(),
  lateFee: JOI.number(),
  lateFeePeriod: JOI.string(),
  otherFee: JOI.number(),
  otherFeeDescription: JOI.string(),
  terminationText: JOI.string(),
  advanceNotice: JOI.string(),
  writtenNotice: JOI.string(),
  licenseeAgreementDate: JOI.date(),
  licenseeAgreementComments: JOI.string(),
  className: JOI.string(),
  biometric_fp: JOI.string().allow(null).allow(""),
  isDeleted: JOI.number().allow(null),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  lastUpdateDateTime: JOI.date(),
});

// parents: JOI.array(),
// emergencyContacts: JOI.array(),
// pickupPermissions: JOI.array(),
// agreementDays: JOI.array()

// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: false, // remove unknown keys from the validated data
};

Application.hasMany(ApplicationParent, {
  foreignKey: "applicationId",
  as: "appparents",
});
Application.hasMany(ApplicationDocument, {
  foreignKey: "applicationId",
  as: "appdocuments",
});

Application.belongsToMany(UserFamily, {
  through: "ApplicationParent",
  foreignKey: "applicationId",
  as: "parents",
});

UserFamily.belongsToMany(Application, {
  through: "ApplicationParent",
  foreignKey: "userFamilyId",
  as: "userFamilieparents",
});

Application.hasMany(ApplicationEmergencyContact, {
  foreignKey: "applicationId",
  as: "appemergencyContacts",
});

Application.belongsToMany(UserFamily, {
  through: "ApplicationEmergencyContact",
  foreignKey: "applicationId",
  as: "emergencyContacts",
});

UserFamily.belongsToMany(Application, {
  through: "ApplicationEmergencyContact",
  foreignKey: "userFamilyId",
  as: "userFamilyemergencycontacts",
});

Application.hasMany(ApplicationPickupPermission, {
  foreignKey: "applicationId",
  as: "apppickupPermissions",
});

Application.belongsToMany(UserFamily, {
  through: "ApplicationPickupPermission",
  foreignKey: "applicationId",
  as: "pickupPermissions",
});

UserFamily.belongsToMany(Application, {
  through: "ApplicationPickupPermission",
  foreignKey: "userFamilyId",
  as: "userFamilypickupPermissions",
});

Application.hasMany(ApplicationAgreementDay, {
  foreignKey: "applicationId",
  as: "applicationAgreementDays",
});
Application.belongsTo(Organization, {
  foreignKey: "orgId",
});
Application.belongsTo(UserChildren, {
  foreignKey: "userChildrenId",
});
Application.hasMany(ApplicationAYClassSection, {
  foreignKey: "applicationId",
  as: "applicationAYClassSections",
});

Application.hasMany(ApplicationScholarships, {
  foreignKey: "applicationId",
  as: "scholarships",
});

const getNextApplicationNumber = async (tenantId, appId, orgId) => {
  const sql = `Select dbo.getNextApplicationNumber('${tenantId}', '${appId}', '${orgId}') as nextApplicationNumber;`;
  const data = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
  return data[0].nextApplicationNumber;
};
const create = async (dataIn, user) => {
  let modelData;
  dataIn.applicationNumber = await getNextApplicationNumber(dataIn.tenantId, dataIn.appId, dataIn.orgId);
  modelData = Application.build(dataIn);
  await modelData.save();

  const selfUserFamily = await getSelf(modelData.userId);
  const pickupPermissionData = {
    applicationId: modelData.applicationId,
    userFamilyId: selfUserFamily.userFamilyId,
  };
  console.log(pickupPermissionData);
  await createApplicationPickupPermission(pickupPermissionData);
  return getById(modelData.tenantId, modelData.appId, modelData.orgId, user, modelData.applicationId);
};

const getById = async (tenantId, appId, orgId, user, id) => {
  console.log("Application - get()/id: ");
  let userHasStaffRole = false;
  if (user && user.userRoles && Array.isArray(user.userRoles)) {
    user.userRoles.forEach((role) => {
      if (role.roleName == "Staff" || role.roleName == "Support Staff") {
        userHasStaffRole = true;
      }
    });
  }
  // console.log(`userHasStaffRole: ${userHasStaffRole}`)

  const whereClause = { tenantId, appId, orgId, isDeleted: 0 };
  if (!userHasStaffRole) {
    whereClause.userId = user.userId;
  }
  console.log(whereClause);

  return Application.findByPk(id, {
    where: whereClause,
    include: [
      { model: Organization },
      { model: UserChildren },
      { model: UserFamily, as: "parents" },
      { model: UserFamily, as: "emergencyContacts" },
      { model: UserFamily, as: "pickupPermissions" },
      { model: ApplicationAgreementDay, as: "applicationAgreementDays" },
      { model: ApplicationDocument, as: "appdocuments" },
      { model: ApplicationAYClassSection, as: "applicationAYClassSections" },
      { model: ApplicationScholarships, as: "scholarships" },
    ],
  });
};

const update = async (dataIn, user, qry) => {
  const { userId } = user;
  const data = await getById(dataIn.tenantId, dataIn.appId, dataIn.orgId, user, dataIn.applicationId);
  if (!data) {
    throw new Error("Application not found!");
  }
  // only appName is allowed to be changed, tenantId is not allowed to change as per business rules
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Staff" || role.roleName == "Support Staff")
            && role.roleId == qry.roleId) {
      console.log(role);
      userHasStaffRole = true;
    }
  });
  // if (!userHasStaffRole && data.applicationStatus != 'DRAFT'){

  // }
  // else if (!userHasStaffRole && data.applicationStatus == 'SUBMITTED'){

  // }
  data.applicationName = dataIn.applicationName ? dataIn.applicationName : data.applicationName;
  data.applicationStatus = dataIn.applicationStatus ? dataIn.applicationStatus : data.applicationStatus;
  data.userChildrenId = dataIn.userChildrenId ? dataIn.userChildrenId : data.userChildrenId;
  data.applicationNotes = dataIn.applicationNotes ? dataIn.applicationNotes : data.applicationNotes;
  data.childEntryDate = dataIn.childEntryDate ? dataIn.childEntryDate : data.childEntryDate;
  data.orgCellphone = dataIn.orgCellphone ? dataIn.orgCellphone : data.orgCellphone;
  data.childExitDate = dataIn.childExitDate ? dataIn.childExitDate : data.childExitDate;
  data.medicalCareProviderName = dataIn.medicalCareProviderName ? dataIn.medicalCareProviderName : data.medicalCareProviderName;
  data.medicalCareProviderAddress = dataIn.medicalCareProviderAddress ? dataIn.medicalCareProviderAddress : data.medicalCareProviderAddress;
  data.medicalCareProviderPhone = dataIn.medicalCareProviderPhone ? dataIn.medicalCareProviderPhone : data.medicalCareProviderPhone;
  data.lastPhysicalExam = dataIn.lastPhysicalExam ? dataIn.lastPhysicalExam : data.lastPhysicalExam;
  data.dentalCareProviderName = dataIn.dentalCareProviderName ? dataIn.dentalCareProviderName : data.dentalCareProviderName;
  data.dentalCareProviderAddress = dataIn.dentalCareProviderAddress ? dataIn.dentalCareProviderAddress : data.dentalCareProviderAddress;
  data.dentalCareProviderPhone = dataIn.dentalCareProviderPhone ? dataIn.dentalCareProviderPhone : data.dentalCareProviderPhone;
  data.lastDentalExam = dataIn.lastDentalExam ? dataIn.lastDentalExam : data.lastDentalExam;
  data.childKnownHealthConditions = dataIn.childKnownHealthConditions ? dataIn.childKnownHealthConditions : data.childKnownHealthConditions;
  data.consentDate = dataIn.consentDate ? dataIn.consentDate : data.consentDate;
  data.fee = dataIn.fee ? dataIn.fee : data.fee;
  data.feeDueDate = dataIn.feeDueDate ? dataIn.feeDueDate : data.feeDueDate;
  data.feePeriod = dataIn.feePeriod ? dataIn.feePeriod : data.feePeriod;
  data.sourceOfPayment = dataIn.sourceOfPayment ? dataIn.sourceOfPayment : data.sourceOfPayment;
  data.otRate = dataIn.otRate ? dataIn.otRate : data.otRate;
  data.otPeriod = dataIn.otPeriod ? dataIn.otPeriod : data.otPeriod;
  data.lateFee = dataIn.lateFee ? dataIn.lateFee : data.lateFee;
  data.lateFeePeriod = dataIn.lateFeePeriod ? dataIn.lateFeePeriod : data.lateFeePeriod;
  data.otherFee = dataIn.otherFee ? dataIn.otherFee : data.otherFee;
  data.otherFeeDescription = dataIn.otherFeeDescription ? dataIn.otherFeeDescription : data.otherFeeDescription;
  data.terminationText = dataIn.terminationText ? dataIn.terminationText : data.terminationText;
  data.advanceNotice = dataIn.advanceNotice ? dataIn.advanceNotice : data.advanceNotice;
  data.writtenNotice = dataIn.writtenNotice ? dataIn.writtenNotice : data.writtenNotice;
  data.licenseeAgreementDate = dataIn.licenseeAgreementDate ? dataIn.licenseeAgreementDate : data.licenseeAgreementDate;
  data.licenseeAgreementComments = dataIn.licenseeAgreementComments ? dataIn.licenseeAgreementComments : data.licenseeAgreementComments;
  data.className = dataIn.className ? dataIn.className : data.className;
  data.biometric_fp = dataIn.biometric_fp ? dataIn.biometric_fp : data.biometric_fp;
  data.applicationNumber = dataIn.applicationNumber ? dataIn.applicationNumber : data.applicationNumber;
  data.isDeleted = dataIn.isDeleted ? dataIn.isDeleted : data.isDeleted;

  return data.save();
};

const get = async (qry, user) => {
  console.log("Application - get(): ");
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    console.log(role.roleName);
    if ((role.roleName == "Staff" || role.roleName == "Support Staff" || role.roleName == "AppAdmin")
            && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId, isDeleted: 0 };
  if (!userHasStaffRole) {
    whereClause.userId = user.userId;
  } else {
    whereClause.applicationStatus = { [ne]: "DRAFT" };
  }
  if (qry.applicationStatus == "APPROVED") {
    whereClause.applicationStatus = "APPROVED";
  }
  if (qry.className) {
    whereClause.className = qry.className;
  }
  if (qry.applicationNumber) {
    whereClause.applicationNumber = qry.applicationNumber;
  }

  return Application.findAll(
    {
      where: whereClause,
      include: [
        { model: Organization },
        { model: UserChildren },
        { model: UserFamily, as: "parents" },
        { model: UserFamily, as: "emergencyContacts" },
        { model: UserFamily, as: "pickupPermissions" },
        { model: ApplicationAgreementDay, as: "applicationAgreementDays" },
        { model: ApplicationDocument, as: "appdocuments" },
        { model: ApplicationAYClassSection, as: "applicationAYClassSections" },
        { model: ApplicationScholarships, as: "scholarships" },
      ],
    },
  );
};

const getApplicationsByClassName = async (qry, user) => {
  console.log("Application - getApplicationsByClassName(): ");
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Staff" || role.roleName == "Support Staff")
            && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId, isDeleted: 0 };
  if (!userHasStaffRole) {
    whereClause.userId = user.userId;
  } else {
    whereClause.applicationStatus = { [ne]: "DRAFT" };
  }
  if (qry.applicationStatus == "APPROVED") {
    whereClause.applicationStatus = "APPROVED";
  }
  if (qry.className) {
    whereClause.className = qry.className;
  }
  console.log(whereClause);
  return Application.findAll(
    {
      where: whereClause,
    },
  );
};

// const del = async (tenantId, appId, userId, applicationId) => {
//     const appl = await Application.findByPk(applicationId, {
//         where: {
//             tenantId: tenantId, appId: appId, userId: userId
//         }
//     });
//     await appl.destroy();
// }

const validate = async (dataIn, userId, id = null) => {
  console.log("Application validate() : ");
  if (id != null) { dataIn.applicationId = id; }
  // if (dataIn.userId !== userId) delete dataIn['userId'] // if userId in data does not match auth token userId, delete it and joischema.validate will throw userId required error
  if (dataIn.orgId === null) { delete dataIn.orgId; }
  if (dataIn.applicationName === null) { delete dataIn.applicationName; } // applicationName is required, if null, joischema.validate will throw applicationName required error
  if (dataIn.applicationStatus === null || dataIn.applicationStatus === "") { delete dataIn.applicationStatus; } // applicationStatus is required, if null, database will insert defailt value of 'DRAFT'
  if (dataIn.applicationStatus === "Select Application Status...") { delete dataIn.applicationStatus; } // if new status is DRAFT, ignore the request
  if (dataIn.userChildrenId === null) { delete dataIn.userChildrenId; }
  if (dataIn.userChildrenId === "Select Child name...") { delete dataIn.userChildrenId; }
  if (dataIn.applicationNotes === null || dataIn.applicationNotes === "") { delete dataIn.applicationNotes; }
  if (dataIn.childEntryDate === null || dataIn.childEntryDate === "") { delete dataIn.childEntryDate; }
  if (dataIn.childExitDate === null || dataIn.childExitDate === "") { delete dataIn.childExitDate; }
  if (dataIn.medicalCareProviderName === null || dataIn.medicalCareProviderName === "") { delete dataIn.medicalCareProviderName; }
  if (dataIn.medicalCareProviderAddress === null || dataIn.medicalCareProviderAddress === "") { delete dataIn.medicalCareProviderAddress; }
  if (dataIn.medicalCareProviderPhone === null || dataIn.medicalCareProviderPhone === "") { delete dataIn.medicalCareProviderPhone; }
  if (dataIn.lastPhysicalExam === null || dataIn.lastPhysicalExam === "") { delete dataIn.lastPhysicalExam; }
  if (dataIn.dentalCareProviderName === null || dataIn.dentalCareProviderName === "") { delete dataIn.dentalCareProviderName; }
  if (dataIn.dentalCareProviderAddress === null || dataIn.dentalCareProviderAddress === "") { delete dataIn.dentalCareProviderAddress; }
  if (dataIn.dentalCareProviderPhone === null || dataIn.dentalCareProviderPhone === "") { delete dataIn.dentalCareProviderPhone; }
  if (dataIn.lastDentalExam === null || dataIn.lastDentalExam === "") { delete dataIn.lastDentalExam; }
  if (dataIn.childKnownHealthConditions === null || dataIn.childKnownHealthConditions === "") { delete dataIn.childKnownHealthConditions; }
  if (dataIn.consentDate === null || dataIn.consentDate === "") { delete dataIn.consentDate; }
  if (dataIn.fee === null || dataIn.fee === "") { delete dataIn.fee; }
  if (dataIn.feeDueDate === null || dataIn.feeDueDate === "") { delete dataIn.feeDueDate; }
  if (dataIn.feePeriod === null || dataIn.feePeriod === "") { delete dataIn.feePeriod; }
  if (dataIn.sourceOfPayment === null || dataIn.sourceOfPayment === "") { delete dataIn.sourceOfPayment; }
  if (dataIn.otRate === null || dataIn.otRate === "") { delete dataIn.otRate; }
  if (dataIn.otPeriod === null || dataIn.otPeriod === "") { delete dataIn.otPeriod; }
  if (dataIn.lateFee === null || dataIn.lateFee === "") { delete dataIn.lateFee; }
  if (dataIn.lateFeePeriod === null || dataIn.lateFeePeriod === "") { delete dataIn.lateFeePeriod; }
  if (dataIn.otherFee === null || dataIn.otherFee === "") { delete dataIn.otherFee; }
  if (dataIn.otherFeeDescription === null || dataIn.otherFeeDescription === "") { delete dataIn.otherFeeDescription; }
  if (dataIn.terminationText === null || dataIn.terminationText === "") { delete dataIn.terminationText; }
  if (dataIn.advanceNotice === null || dataIn.advanceNotice === "") { delete dataIn.advanceNotice; }
  if (dataIn.writtenNotice === null || dataIn.writtenNotice === "") { delete dataIn.writtenNotice; }
  if (dataIn.licenseeAgreementDate === null || dataIn.licenseeAgreementDate === "") { delete dataIn.licenseeAgreementDate; }
  if (dataIn.licenseeAgreementComments === null || dataIn.licenseeAgreementComments === "") { delete dataIn.licenseeAgreementComments; }
  if (dataIn.className === null || dataIn.className === "") { delete dataIn.className; }
  if (dataIn.applicationNumber === null || dataIn.applicationNumber === "") { delete dataIn.applicationNumber; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    const app = await appGetById(value.tenantId, value.appId);
    if (app == null) { throw new Error("Invalid tenant / app !"); }
    const org = await orgGetById(value.tenantId, value.appId, value.orgId);
    if (org == null) { throw new Error("Invalid organization!"); }

    return value;
  }
};

module.exports = {
  Application,
  create,
  update,
  get,
  getById,
  validate,
  getApplicationsByClassName,
};

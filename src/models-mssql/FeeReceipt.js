const { Sequelize, DataTypes, Model, Op } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

const appUserRoleId = "AF31655A-065A-462C-84B7-3E166F41BAFE"; // AppUser role
const getSelfUserFamilyId = require("./UserFamily").getSelf;
const dayjs = require("dayjs");
const { Application } = require("./Application");
const { ApplicationAYClassSection } = require("./ApplicationAYClassSection");

class FeeReceipt extends Model { }

FeeReceipt.init({
  feeReceiptId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  appId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  orgId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  applicationAYClassSectionId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  feeReceiptNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feeReceivedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  feeCurrency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feeAmount: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  feeAmountInWords: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feeType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feeDurationStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  feeDurationEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feeReceiptNotes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feeReceivedFrom: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "FeeReceipt",
  tableName: "FeeReceipts",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

FeeReceipt.belongsTo(Application, {
  foreignKey: "applicationId",
});

FeeReceipt.belongsTo(ApplicationAYClassSection, {
  foreignKey: "applicationAYClassSectionId",
});

const joiSchema = JOI.object().keys({
  feeReceiptId: JOI.string(),
  applicationId: JOI.string().allow(null),
  applicationAYClassSectionId: JOI.string().allow(null),
  feeReceiptNumber: JOI.string(),
  feeReceivedDate: JOI.string(),
  feeCurrency: JOI.string(),
  feeAmount: JOI.number(),
  feeAmountInWords: JOI.string(),
  feeType: JOI.string(),
  feeDurationStartDate: JOI.date(),
  feeDurationEndDate: JOI.date(),
  paymentMethod: JOI.string(),
  feeReceivedFrom: JOI.string(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

function checkIfValidUUID(str) {
  // Regular expression to check if string is a valid UUID
  // According to RFC 4122, a valid UUID has 32 characters under five sections, where a dash character separates each. The first section has eight characters, the second, the third, the fourth has 4, and the last section 12. UUIDs are written in hexadecimal, and therefore, each digit can be from 0 to 9 or a letter from a to f.
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(str);
}

const get = async (user, qry) => {
  const { userId } = user;
  let userHasStaffRole = false;
  const whereClause = {};

  if (!qry) {
    console.log("Invalid params, returning []");
    return [];
  }
  user.userRoles.forEach((role) => {
    console.log(role.roleName, qry.roleId);
    if (role.roleName == "Staff" || role.roleName == "Support Staff") {
      if (qry.roleId == role.roleId) {
        userHasStaffRole = true;
      }
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  if (!userHasStaffRole) {
    if (qry.roleId && qry.roleId == appUserRoleId && checkIfValidUUID(qry.applicationId)) {
      whereClause.applicationId = qry.applicationId;
    } else {
      console.log("applicationId null, returning []");
      return [];
    }
  } else if (checkIfValidUUID(qry.applicationId)) {
    whereClause.applicationId = qry.applicationId;
  }
  if (checkIfValidUUID(qry.applicationAYClassSectionId)) {
    whereClause.applicationAYClassSectionId = qry.applicationAYClassSectionId;
  }
  whereClause.tenantId = qry.tenantId;
  whereClause.appId = qry.appId;
  whereClause.orgId = qry.orgId;

  const tdt = new Date(); let tdtFrom = new Date(); let
    tdtTo = new Date();
  let d1 = dayjs(tdt).format("YYYY-MM-DD");
  let d2 = (dayjs(tdt).add(1, "day")).format("YYYY-MM-DD");

  if (qry.feeDurationStartDateFrom && Date.parse(qry.feeDurationStartDateFrom)) {
    tdtFrom = qry.feeDurationStartDateFrom;
    d1 = dayjs(tdtFrom).format("YYYY-MM-DD");
    d2 = (dayjs(tdtFrom).add(1, "day")).format("YYYY-MM-DD");
  }
  if (qry.feeDurationStartDateTo && Date.parse(qry.feeDurationStartDateTo)) {
    tdtTo = qry.feeDurationStartDateTo;
    d2 = (dayjs(tdtTo).add(1, "day")).format("YYYY-MM-DD");
  }
  if (qry.feeDurationStartDateFrom || qry.feeDurationStartDateTo) {
    whereClause.feeDurationStartDate = { [Op.between]: [d1, d2] };
  }
  if ((qry.dateFrom && Date.parse(qry.dateFrom)) && (qry.dateTo && Date.parse(qry.dateTo))) {
    tdtFrom = qry.dateFrom;
    tdtTo = qry.dateTo;
    d1 = dayjs(tdtFrom).format("YYYY-MM-DD");
    d2 = (dayjs(tdtTo)).format("YYYY-MM-DD");
    whereClause.feeReceivedDate = { [Op.between]: [d1, d2] };
  }

  console.log(200, whereClause);
  const feeReceipts = await FeeReceipt.findAll({
    where: whereClause,
    include: [{ model: Application },
      { model: ApplicationAYClassSection }],
  });
  return feeReceipts;
};

const getById = async (id) => FeeReceipt.findOne({
  where: { feeReceiptId: id },
});
const create = async (dataIn) => {
  let modelData;
  modelData = FeeReceipt.build(dataIn);
  await modelData.save();
  return modelData;
};

const update = async (dataIn) => {
  const data = await getById(dataIn.feeReceiptId);
  // only checkout fields. confirmation fields are allowed to be changed as per business rules
  data.applicationId = dataIn.applicationId ? dataIn.applicationId : data.applicationId;
  data.applicationAYClassSectionId = dataIn.applicationAYClassSectionId ? dataIn.applicationAYClassSectionId : data.applicationAYClassSectionId;
  data.feeReceiptNumber = dataIn.feeReceiptNumber ? dataIn.feeReceiptNumber : data.feeReceiptNumber;
  data.feeReceivedDate = dataIn.feeReceivedDate ? dataIn.feeReceivedDate : data.feeReceivedDate;
  data.feeCurrency = dataIn.feeCurrency ? dataIn.feeCurrency : data.feeCurrency;
  data.feeAmount = dataIn.feeAmount ? dataIn.feeAmount : data.feeAmount;
  data.feeAmountInWords = dataIn.feeAmountInWords ? dataIn.feeAmountInWords : data.feeAmountInWords;
  data.feeType = dataIn.feeType ? dataIn.feeType : data.feeType;
  data.feeDurationStartDate = dataIn.feeDurationStartDate ? dataIn.feeDurationStartDate : data.feeDurationStartDate;
  data.feeDurationEndDate = dataIn.feeDurationEndDate ? dataIn.feeDurationEndDate : data.feeDurationEndDate;
  data.paymentMethod = dataIn.paymentMethod ? dataIn.paymentMethod : data.paymentMethod;
  data.feeReceivedFrom = dataIn.feeReceivedFrom ? dataIn.feeReceivedFrom : data.feeReceivedFrom;
  return data.save();
};

const validate = async (qry, dataIn, user, id = null) => {
  // console.log(' dataIn : ', dataIn)
  if (!(qry.tenantId && qry.appId && qry.orgId)) {
    throw new Error("Validation error: Invalid AppId!");
  }
  const { userId } = user;
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if (role.roleName == "Staff" || role.roleName == "Support Staff") {
      userHasStaffRole = true;
    }
  });

  if (id != null) { dataIn.feeReceiptId = id; }
  if (dataIn.applicationAYClassSectionId === null) { delete dataIn.applicationAYClassSectionId; }
  if (dataIn.applicationId === null) { delete dataIn.applicationId; }
  if (dataIn.feeReceiptNumber === null) { delete dataIn.feeReceiptNumber; }
  if (dataIn.feeReceivedDate === null) { delete dataIn.feeReceivedDate; }
  if (dataIn.feeCurrency === null) { delete dataIn.feeCurrency; }
  if (dataIn.feeAmount === null) { delete dataIn.feeAmount; }
  if (dataIn.feeAmountInWords === null) { delete dataIn.feeAmountInWords; }
  if (dataIn.feeType === null) { delete dataIn.feeType; }
  if (dataIn.feeDurationStartDate === null) { delete dataIn.feeDurationStartDate; }
  if (dataIn.feeDurationEndDate === null) { delete dataIn.feeDurationEndDate; }
  if (dataIn.paymentMethod === null) { delete dataIn.paymentMethod; }
  if (dataIn.feeReceivedFrom === null) { delete dataIn.feeReceivedFrom; }

  // console.log('dataIn :  ', dataIn);

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    value.tenantId = user.tenantId;
    value.appId = user.appId;
    value.orgId = user.orgId ? user.orgId : qry.orgId;
    return value;
  }
};

module.exports = {
  FeeReceipt,
  get,
  create,
  update,
  validate,
};

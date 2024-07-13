const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

// const { AcademicYearHoliday } = require('./AcademicYearHoliday');

class Expenses extends Model {
}

Expenses.init({
  expenseId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  expenseAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  expenseAmount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expensePaymentType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expenseRemarks: {
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
    type: DataTypes.STRING,
    allowNull: false,
  },
  appId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: "Expenses",
  tableName: "expenses",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  expenseId: JOI.string(),
  expenseAccountId: JOI.string(),
  expenseAmount: JOI.string().required(),
  expensePaymentType: JOI.string().required(),
  expenseRemarks: JOI.string(),
  lastUpdatedDateTime: JOI.date(),
  orgId: JOI.string().required(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
});

// AcademicYears.hasMany(AcademicYearHoliday, {
//     foreignKey: "expenseAccountId",
//     as:'expenses'
// })

// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (obj) => {
  console.log("Creating new expense");
  const o = Expenses.build(obj);
  return await o.save();
};

const getById = async (id) => await Expenses.findByPk(id);
const update = async (dataIn) => {
  console.log("Expense Update: ", dataIn);
  const data = await getById(dataIn.expenseId);
  // only appName is allowed to be changed, expenseAccountId is not allowed to change as per business rules
  data.expenseAccountId = dataIn.expenseAccountId ? dataIn.expenseAccountId : data.expenseAccountId;
  data.expenseAmount = dataIn.expenseAmount ? dataIn.expenseAmount : data.expenseAmount;
  data.expensePaymentType = dataIn.expensePaymentType ? dataIn.expensePaymentType : data.expensePaymentType;
  data.expenseRemarks = dataIn.expenseRemarks ? dataIn.expenseRemarks : data.expenseRemarks;
  return await data.save();
};
const del = async (id) => await Expenses.destroy({ where: { expenseId: id } });

const get = async (qry, user) => {
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Support Staff")
            && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId };

  return await Expenses.findAll({
    where: whereClause,
    // , include: [
    //     { model: AcademicYearHoliday, as: "academicYearHolidays"},
    // ]
  });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.expenseId = id; }

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
  Expenses,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

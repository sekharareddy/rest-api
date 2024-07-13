const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const dayjs = require("dayjs");
const sequelize = require("../utils/sequelize");

const { Expenses } = require("./Expenses");

class ExpenseAccount extends Model {
}

ExpenseAccount.init({
  expenseAccountId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  expenseAccountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expenseAccountType: {
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
  modelName: "ExpenseAccount",
  tableName: "expenseAccounts",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  expenseAccountId: JOI.string(),
  expenseAccountName: JOI.string().required(),
  expenseAccountType: JOI.string(),
  lastUpdatedDateTime: JOI.date(),
  orgId: JOI.string().required(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
});

ExpenseAccount.hasMany(Expenses, {
  foreignKey: "expenseAccountId",
  as: "expenses",
});

// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (obj) => {
  console.log("Creating new expenseAccount");
  const o = ExpenseAccount.build(obj);
  return await o.save();
};

const getById = async (id) => await ExpenseAccount.findByPk(id);
const update = async (dataIn) => {
  console.log("Expense Account Update: ", dataIn);
  const data = await getById(dataIn.expenseAccountId);
  // only appName is allowed to be changed, expenseAccountId is not allowed to change as per business rules
  data.expenseAccountId = dataIn.expenseAccountId ? dataIn.expenseAccountId : data.expenseAccountId;
  data.expenseAccountName = dataIn.expenseAccountName ? dataIn.expenseAccountName : data.expenseAccountName;
  data.expenseAccountType = dataIn.expenseAccountType ? dataIn.expenseAccountType : data.expenseAccountType;
  return await data.save();
};
const del = async (id) => await ExpenseAccount.destroy({ where: { expenseAccountId: id } });

const get = async (qry, user) => {
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Support Staff")
            && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);

  const tdt = new Date(); let tdtFrom = new Date(); let
    tdtTo = new Date();
  let d1 = dayjs(tdt).format("YYYY-MM-DD");
  let d2 = (dayjs(tdt).add(1, "day")).format("YYYY-MM-DD");

  const whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId };
  const expwhereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId };

  if (qry.expFrom) {
    if (qry.expFrom) { tdtFrom = new Date(qry.expFrom); } else { tdtFrom = new Date(qry.expFrom); }
    console.log("qry[\"expFrom\"]: ", tdtFrom);
    // if (qry['timeZone'])
    //     tdtFrom = dayjs(tdt).add(qry['timeZone'], 'minute')
    d1 = dayjs(tdtFrom).format("YYYY-MM-DD");
    d2 = (dayjs(tdtFrom).add(1, "day")).format("YYYY-MM-DD");
  }
  if (qry.expTo) {
    if (qry.expTo) { tdtTo = new Date(qry.expTo); } else { tdtTo = new Date(qry.expTo); }
    console.log("qry[\"expTo\"]: ", tdtTo);
    // if (qry['timeZone'])
    //     tdtTo = dayjs(tdt).add(qry['timeZone'], 'minute')
    d2 = (dayjs(tdtTo).add(1, "day")).format("YYYY-MM-DD");
  }

  if (qry.expFrom && qry.expTo) {
    expwhereClause.createdDateTime = { [Op.between]: [d1, d2] };
    return await ExpenseAccount.findAll({
      where: whereClause,
      include: [
        { model: Expenses, as: "expenses", where: expwhereClause },
      ],
    });
  }
  return await ExpenseAccount.findAll({
    where: whereClause,
    include: [
      { model: Expenses, as: "expenses" },
    ],
  });
};
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.expenseAccountId = id; }

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
  ExpenseAccount,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

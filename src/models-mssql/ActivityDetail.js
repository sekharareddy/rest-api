const { Sequelize, DataTypes, Model, Op } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class ActivityDetail extends Model {}

ActivityDetail.init({
  activityDetailId: {
    type: DataTypes.UUID,

    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  activityId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  activityDetailType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  activityDetailLabel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  activityDetailSortOrderNumber: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  activityDetailDescription: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  activityDetailNotes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdByUserId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  lastUpdatedByUserId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: "ActivityDetail",
  tableName: "ActivityDetails",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  activityDetailId: JOI.string(),
  activityId: JOI.string(),
  activityDetailType: JOI.string(),
  activityDetailLabel: JOI.string(),
  activityDetailDescription: JOI.string(),
  activityDetailSortOrderNumber: JOI.number(),
  activityDetailNotes: JOI.string(),
  createdByUserId: JOI.string(),
  lastUpdatedByUserId: JOI.string(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const get = async (user, activityId) => {
  const { userId } = user;
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if (role.roleName == "Staff" && qry && qry.roleId == "Staff") {
      userHasStaffRole = true;
    }
  });
  const whereClause = { activityId };

  return ActivityDetail.findAll({
    where: whereClause,
  });
};

const getById = async (id) => ActivityDetail.findOne({
  where: { activityDetailId: id },
});

const create = async (dataIn) => {
  let modelData;
  modelData = ActivityDetail.build(dataIn);
  return await modelData.save();
};
const update = async (dataIn) => {
  const data = await getById(dataIn.activityDetailId);
  // console.log(data)
  // only activityStatus, activityNotes fields are allowed to be changed as per business rules
  data.activityDetailType = dataIn.activityDetailType ? dataIn.activityDetailType : data.activityDetailType;
  data.activityDetailLabel = dataIn.activityDetailLabel ? dataIn.activityDetailLabel : data.activityDetailLabel;
  data.activityDetailDescription = dataIn.activityDetailDescription ? dataIn.activityDetailDescription : data.activityDetailDescription;
  data.activityDetailNotes = dataIn.activityDetailNotes ? dataIn.activityDetailNotes : data.activityDetailNotes;
  data.activityDetailSortOrderNumber = dataIn.activityDetailSortOrderNumber ? dataIn.activityDetailSortOrderNumber : data.activityDetailSortOrderNumber;
  await data.save();
  return data;
};
const del = async (id) => {
  const activity = await getById(id);
  await activity.destroy();
};

const validate = async (dataIn, user, id = null) => {
  // console.log(' dataIn : ', dataIn)
  if (dataIn.activityDetailNotes == "") { delete dataIn.activityDetailNotes; }
  if (dataIn.activityDetailLabel == "") { delete dataIn.activityDetailLabel; }
  if (dataIn.activityDetailDescription == "") { delete dataIn.activityDetailDescription; }
  if (dataIn.activityDetailSortOrderNumber == "") { delete dataIn.activityDetailSortOrderNumber; }
  if (dataIn.activityDetailType == "") { delete dataIn.activityDetailType; }

  const { userId } = user;
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if (role.roleName == "Staff") {
      userHasStaffRole = true;
    }
  });
  if (!userHasStaffRole) {
    throw new Error("Insufficient Role permissions!");
    return;
  }

  if (id != null) {
    dataIn.activityDetailId = id;
  } else {
    dataIn.createdByUserId = userId;
  }
  dataIn.lastUpdatedByUserId = userId;
  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    return value;
  }
};

module.exports = {
  ActivityDetail,
  get,
  create,
  update,
  del,
  validate,
};

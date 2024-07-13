const { Sequelize, DataTypes, Model, Op } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
// const { Attendance } = require('./Attendance');
const { ActivityDetail } = require("./ActivityDetail");
const createActivityDetail = require("./ActivityDetail").create;

class Activity extends Model {}

Activity.init({
  activityId: {
    type: DataTypes.UUID,

    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  attendanceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  activityStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  activityNotes: {
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
  modelName: "Activity",
  tableName: "Activities",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

// Activity.belongsTo(Attendance, {
//     foreignKey: "attendanceId"
// })
Activity.hasMany(ActivityDetail, {
  foreignKey: "activityId",
  as: "rowFormData",
});

const joiSchema = JOI.object().keys({
  activityId: JOI.string(),
  attendanceId: JOI.string(),
  activityStatus: JOI.string(),
  activityNotes: JOI.string(),
  createdByUserId: JOI.string(),
  lastUpdatedByUserId: JOI.string(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const get = async (user, qry, yr = null, mth = null, dt = null) => {
  const { userId } = user;
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if (role.roleName == "Staff" && qry && qry.roleId == "Staff") {
      userHasStaffRole = true;
    }
  });
  // console.log(`userHasStaffRole: ${userHasStaffRole}`)
  const tdt = new Date();
  const { attendanceId } = qry;

  const whereClause = {};
  if (qry && qry.attendanceId) {
    whereClause.attendanceId = attendanceId;
  }
  // if (!userHasStaffRole) {
  //     whereClause['checkInApplicationPickupPermissionsId'] = userId
  // }
  // whereClause['datepart(yyyy, checkInDateTime)'] = yr || tdt.getFullYear()
  // whereClause['datepart(mm, checkInDateTime)'] = mth || tdt.getMonth()
  // whereClause['datepart(dd, checkInDateTime)'] = dt || tdt.getDate()

  return Activity.findAll({
    where: whereClause,
    include: [
      { model: ActivityDetail, as: "rowFormData" },
      // { model: Attendance },
    ],
  });
};

const getById = async (id) => Activity.findOne({
  where: { activityId: id },
  include: [
    { model: ActivityDetail, as: "rowFormData" },
  ],
});

const create = async (dataIn) => {
  let modelData;
  modelData = Activity.build(dataIn);
  await modelData.save();

  const activityDetails = [];
  let activityDetail = await createActivityDetail({
    activityId: modelData.activityId,
    activityDetailType: "Meals",
    activityDetailLabel: "Breakfast",
    activityDetailSortOrderNumber: 1,
    createdByUserId: modelData.createdByUserId,
    lastUpdatedByUserId: modelData.createdByUserId,
  });
  activityDetails[0] = activityDetail;
  activityDetail = await createActivityDetail({
    activityId: modelData.activityId,
    activityDetailType: "Meals",
    activityDetailLabel: "Lunch",
    activityDetailSortOrderNumber: 2,
    createdByUserId: modelData.createdByUserId,
    lastUpdatedByUserId: modelData.createdByUserId,
  });
  activityDetails[1] = activityDetail;
  activityDetail = await createActivityDetail({
    activityId: modelData.activityId,
    activityDetailType: "Meals",
    activityDetailLabel: "Snacks",
    activityDetailSortOrderNumber: 3,
    createdByUserId: modelData.createdByUserId,
    lastUpdatedByUserId: modelData.createdByUserId,
  });
  activityDetails[2] = activityDetail;
  activityDetail = await createActivityDetail({
    activityId: modelData.activityId,
    activityDetailType: "Rest",
    activityDetailLabel: "Start",
    activityDetailSortOrderNumber: 4,
    createdByUserId: modelData.createdByUserId,
    lastUpdatedByUserId: modelData.createdByUserId,
  });
  activityDetails[3] = activityDetail;
  activityDetail = await createActivityDetail({
    activityId: modelData.activityId,
    activityDetailType: "Rest",
    activityDetailLabel: "End",
    activityDetailSortOrderNumber: 5,
    createdByUserId: modelData.createdByUserId,
    lastUpdatedByUserId: modelData.createdByUserId,
  });
  activityDetails[4] = activityDetail;
  activityDetail = await createActivityDetail({
    activityId: modelData.activityId,
    activityDetailType: "Learning",
    activityDetailLabel: "Learning",
    activityDetailSortOrderNumber: 6,
    createdByUserId: modelData.createdByUserId,
    lastUpdatedByUserId: modelData.createdByUserId,
  });
  activityDetails[5] = activityDetail;
  activityDetail = await createActivityDetail({
    activityId: modelData.activityId,
    activityDetailType: "Activities",
    activityDetailLabel: "Activities",
    activityDetailSortOrderNumber: 7,
    createdByUserId: modelData.createdByUserId,
    lastUpdatedByUserId: modelData.createdByUserId,
  });
  activityDetails[6] = activityDetail;
  activityDetail = await createActivityDetail({
    activityId: modelData.activityId,
    activityDetailType: "Comments",
    activityDetailLabel: "Comments",
    activityDetailSortOrderNumber: 8,
    createdByUserId: modelData.createdByUserId,
    lastUpdatedByUserId: modelData.createdByUserId,
  });
  activityDetails[7] = activityDetail;

  modelData.dataValues.rowFormData = [activityDetails];

  return modelData;
};
const update = async (dataIn) => {
  const data = await getById(dataIn.activityId);
  // only activityStatus, activityNotes fields are allowed to be changed as per business rules
  data.activityStatus = dataIn.activityStatus ? dataIn.activityStatus : data.activityStatus;
  data.activityNotes = dataIn.activityNotes ? dataIn.activityNotes : data.activityNotes;
  return data.save();
};

const del = async (id) => {
  const activity = await getById(id);
  await activity.destroy();
};

const validate = async (dataIn, user, id = null) => {
  console.log(" dataIn : ", dataIn);
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
    dataIn.activityId = id;
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
  Activity,
  get,
  create,
  update,
  del,
  validate,
};

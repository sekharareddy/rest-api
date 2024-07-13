const { Sequelize, DataTypes, Model, Op } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { AppUser, getByAuthCode, create: createUser } = require("./AppUser");
const { Activity } = require("./Activity");

const appUserRoleId = "AF31655A-065A-462C-84B7-3E166F41BAFE"; // AppUser role
const dayjs = require("dayjs");

class StaffAttendance extends Model { }

StaffAttendance.init({
  staffAttendanceId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  checkInDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  checkInConfirmedByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  checkInConfirmedDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  checkOutDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  checkOutConfirmedByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  checkOutConfirmedDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  lastUpdatedByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "StaffAttendance",
  tableName: "staffAttendance",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

class vwStaffAttendance extends Model { }

vwStaffAttendance.init({
  staffAttendanceId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
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
  orgId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userFirstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userLastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userFullName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  checkInDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  checkInConfirmedByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  checkInConfirmedDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  checkOutDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  checkOutConfirmedByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  checkOutConfirmedDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  lastUpdatedByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "vwStaffAttendance",
  tableName: "vw_staffAttendance",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

StaffAttendance.belongsTo(AppUser, {
  foreignKey: "userId",
});

vwStaffAttendance.belongsTo(AppUser, {
  foreignKey: "userId",
});

const joiSchema = JOI.object().keys({
  staffAttendanceId: JOI.string(),
  userId: JOI.string(),
  checkInConfirmedByUserId: JOI.string(),
  checkInConfirmedDateTime: JOI.date(),
  checkOutDateTime: JOI.date(),
  checkOutConfirmedByUserId: JOI.string(),
  checkOutConfirmedDateTime: JOI.date(),
  createdByUserId: JOI.string(),
  lastUpdatedByUserId: JOI.string(),
  lastUpdatedByDateTime: JOI.date(),
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
  let userHasStaffTerminalRole = false;
  let userHasStaffAdminRole = false;
  let userHasStaffRole = false;
  const whereClause = {};

  if (!qry) {
    console.log("Invalid params, returning []");
    return [];
  }

  user.userRoles.forEach((role) => {
    // console.log(role.roleName, qry.roleId )
    if (role.roleName == "Staff Terminal") {
      // userHasStaffTerminalRole = true
      if (qry.roleId == role.roleId) {
        userHasStaffTerminalRole = true;
      }
    } else if (role.roleName == "Staff") {
      if (qry.roleId == role.roleId) {
        userHasStaffRole = true;
      }
    } else if (role.roleName == "Staff Admin") {
      if (qry.roleId == role.roleId) {
        userHasStaffAdminRole = true;
      }
    }
  });

  if (!userHasStaffTerminalRole && !userHasStaffRole && !userHasStaffAdminRole) {
    throw new Error("Insufficient Permissions!");
  }
  if (!userHasStaffTerminalRole && !userHasStaffAdminRole && userHasStaffRole) {
    whereClause.userId = user.userId;
  }

  let tdt = new Date(); let tdtFrom = new Date(); let
    tdtTo = new Date();
  let d1 = dayjs(tdt).format("YYYY-MM-DD");
  let d2 = (dayjs(tdt).add(1, "day")).format("YYYY-MM-DD");

  if (qry.checkInDateTime) {
    tdt = new Date(qry.checkInDateTime);
    d1 = dayjs(tdt).format("YYYY-MM-DD");
    d2 = (dayjs(tdt).add(1, "day")).format("YYYY-MM-DD");
  }
  if (qry.checkInDateTimeFrom) {
    tdtFrom = new Date(qry.checkInDateTimeFrom);
    d1 = dayjs(tdtFrom).format("YYYY-MM-DD");
    d2 = (dayjs(tdtFrom).add(1, "day")).format("YYYY-MM-DD");
  }
  if (qry.checkInDateTimeTo) {
    tdtTo = new Date(qry.checkInDateTimeTo);
    d2 = (dayjs(tdtTo).add(1, "day")).format("YYYY-MM-DD");
  }

  console.log(240, qry);

  whereClause.checkInDateTime = { [Op.between]: [d1, d2] };
  whereClause.tenantId = user.tenantId;
  whereClause.appId = user.appId;
  whereClause.orgId = qry.orgId;
  console.log(whereClause, qry);
  const att = await vwStaffAttendance.findAll({
    where: whereClause,
    include: [
      { model: AppUser },
    ],
  });
  console.log(253, JSON.stringify(att));
  return att;
};

const getReportData = async (user, qry) => {
  const { userId } = user;
  const userHasStaffTerminalRole = false;
  let userHasStaffAdminRole = false;
  const userHasStaffRole = false;
  const whereClause = {};

  if (!qry) {
    console.log("Invalid params, returning []");
    return [];
  }

  user.userRoles.forEach((role) => {
    // console.log(role.roleName, qry )
    if (role.roleName == "Staff Admin") {
      if (qry.roleId == role.roleId) {
        userHasStaffAdminRole = true;
      }
    }
  });

  if (!userHasStaffAdminRole) {
    throw new Error("Insufficient Permissions!");
  }

  // let d1 = dayjs(tdt).format('YYYY-MM-DD')
  const strQuery = "select * from [dbo].[getStaffAttendanceReportData] \
              (:startDate, :endDate, :tenantId, :appId, :orgId)";
  const objReplacements = {
    tenantId: qry.tenantId,
    appId: qry.appId,
    orgId: qry.orgId,
    startDate: (qry.checkInDateTimeFrom || new Date()),
    endDate: (qry.checkInDateTimeTo || new Date()),
  };
  const att = [];
  await sequelize
    .query(strQuery, { replacements: objReplacements })
    .then((v) => {
      data = v[0];
    })
    .catch((err) => {
      console.error(102, err);
      throw err;
    });
  console.log("returing", data.length);
  return data;
};

const getById = async (id) => StaffAttendance.findOne({
  where: { staffAttendanceId: id },
});
const getByUserId = async (userId) => StaffAttendance.findOne({
  where: { userId },
});

const create = async (dataIn) => {
  let modelData;
  modelData = StaffAttendance.build(dataIn);
  await modelData.save();
  console.log(dataIn, modelData);

  return modelData;
};

const update = async (dataIn) => {
  if (!dataIn || !dataIn.staffAttendanceId) {
    throw new Error("Validation error: Invalid AuthCode!");
  }
  const data = await getById(dataIn.staffAttendanceId);
  // only checkout fields. confirmation fields are allowed to be changed as per business rules
  data.checkInConfirmedByUserId = dataIn.checkInConfirmedByUserId ? dataIn.checkInConfirmedByUserId : data.checkInConfirmedByUserId;
  data.checkInConfirmedDateTime = dataIn.checkInConfirmedDateTime ? dataIn.checkInConfirmedDateTime : data.checkInConfirmedDateTime;
  data.checkOutDateTime = dataIn.checkOutDateTime ? dataIn.checkOutDateTime : data.checkOutDateTime;
  data.checkOutConfirmedByUserId = dataIn.checkOutConfirmedByUserId ? dataIn.checkOutConfirmedByUserId : data.checkOutConfirmedByUserId;
  data.checkOutConfirmedDateTime = dataIn.checkOutConfirmedDateTime ? dataIn.checkOutConfirmedDateTime : data.checkOutConfirmedDateTime;
  data.lastUpdatedByUserId = dataIn.lastUpdatedByUserId ? dataIn.lastUpdatedByUserId : data.lastUpdatedByUserId;
  data.lastUpdatedDateTime = dataIn.lastUpdatedDateTime ? dataIn.lastUpdatedDateTime : data.lastUpdatedDateTime;
  return data.save();
};

const validate = async (qry, dataIn, user, id = null) => {
  console.log(" dataIn : ", dataIn);
  if (!(qry.tenantId && qry.appId && qry.orgId)) {
    throw new Error("Validation error: Invalid AppId!");
  }
  const { userId } = user;
  let userHasStaffTerminalRole = false;
  let userHasStaffAdminRole = false;
  user.userRoles.forEach((role) => {
    if (role.roleName == "Staff Terminal") {
      userHasStaffTerminalRole = true;
    } else if (role.roleName == "Staff Admin") {
      userHasStaffAdminRole = true;
    }
  });
  if (((dataIn.attendanceType == 0 || dataIn.attendanceType == 2) && !userHasStaffTerminalRole)) {
    throw new Error("Error: Insufficient Permissions!");
  } else if (((dataIn.attendanceType == 1 || dataIn.attendanceType == 3) && !userHasStaffAdminRole)) {
    throw new Error("Error: Insufficient Permissions!");
  }
  const tdt = new Date();

  if (dataIn.attendanceType == 0 && dataIn.authCodeFull && userHasStaffTerminalRole) { // checkin post call
    const appUser = await getByAuthCode(qry.tenantId, qry.appId, qry.orgId, dataIn.authCodeFull);
    if (!appUser) {
      throw new Error("Validation error: Invalid AuthCode!");
    }
    dataIn = { userId: appUser.userId };
    dataIn.createdByUserId = userId;
    dataIn.lastUpdatedByUserId = userId;

    // let d1 = dayjs(new Date()).format('YYYY-MM-DD')
    const d1 = (dayjs(new Date()).add(-1, "day")).format("YYYY-MM-DD");
    const d2 = (dayjs(new Date()).add(2, "day")).format("YYYY-MM-DD");
    const whereClause = {};
    whereClause.checkInDateTime = { [Op.between]: [d1, d2] };
    whereClause.userId = appUser.userId;
    whereClause.checkOutConfirmedDateTime = { [Op.is]: null };
    // console.log(whereClause)
    const att = await StaffAttendance.findAll({ where: whereClause });
    // console.log(att)
    if (att && att.length > 0) {
      // return {"success": false, "message":`Validation error: Already checked in for the day!`}
      throw new Error("Validation error: Already checked in for the day!");
    }
  } else if (dataIn.attendanceType == 1 && userHasStaffAdminRole && id) { // checkin confirmation, put/:id call by staff user
    dataIn = { checkInConfirmedByUserId: userId };
    dataIn.checkInConfirmedDateTime = Date.now();
    // dataIn['checkInApplicationPickupPermissionsId'] = dataIn['checkInApplicationPickupPermissionsId']
    if (id != null) { dataIn.staffAttendanceId = id; }
    dataIn.lastUpdatedByUserId = userId;
  } else if (dataIn.attendanceType == 2 && dataIn.authCodeFull && userHasStaffTerminalRole) { // checkout put call by user
    const appUser = await getByAuthCode(qry.tenantId, qry.appId, qry.orgId, dataIn.authCodeFull);
    if (!appUser) {
      throw new Error("Validation error: Invalid AuthCode!");
    }
    dataIn.checkOutDateTime = Date.now();
    dataIn.lastUpdatedByUserId = userId;
    dataIn.lastUpdatedDateTime = Date.now();
    // dataIn['checkInApplicationPickupPermissionsId'] = dataIn['checkInApplicationPickupPermissionsId']
    // let d1 = dayjs(new Date()).format('YYYY-MM-DD')
    const d1 = (dayjs(new Date()).add(-1, "day")).format("YYYY-MM-DD");
    const d2 = (dayjs(new Date()).add(2, "day")).format("YYYY-MM-DD");
    const whereClause = {};
    whereClause.checkInDateTime = { [Op.between]: [d1, d2] };
    whereClause.userId = appUser.userId;
    whereClause.checkOutConfirmedDateTime = { [Op.is]: null };
    console.log(whereClause);
    const att = await StaffAttendance.findOne({ where: whereClause });
    // console.log(att)
    if (!att) {
      // return {"success": false, "message":`Validation error: User not checked in for the day!`}
      throw new Error("Validation error: User not checked in or already checkedout  for the day!");
    }
    dataIn.staffAttendanceId = att.staffAttendanceId;
    dataIn.lastUpdatedByUserId = userId;
    console.log(att, dataIn);
  } else if (dataIn.attendanceType == 3 && userHasStaffAdminRole && id) { // checkout confirmation
    dataIn = { checkOutConfirmedByUserId: userId };
    dataIn.checkOutConfirmedDateTime = Date.now();
    // dataIn['checkInApplicationPickupPermissionsId'] = dataIn['checkInApplicationPickupPermissionsId']
    if (id != null) { dataIn.staffAttendanceId = id; }
    dataIn.lastUpdatedByUserId = userId;
  } else {
    throw new Error("Validation error: Invalid attendanceType!");
  }

  console.log("dataIn :  ", dataIn);

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
  } else {
    // validate foreign keys and any other business requiremets
    return value;
  }
};

module.exports = {
  StaffAttendance,
  get,
  getReportData,
  create,
  update,
  validate,
};

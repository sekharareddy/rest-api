const { Sequelize, DataTypes, Model, Op } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { PickupPermission, getByAuthCode } = require("./PickupPermission");
const createActivity = require("./Activity").create;
const { Activity } = require("./Activity");

const appUserRoleId = "AF31655A-065A-462C-84B7-3E166F41BAFE"; // AppUser role
const getSelfUserFamilyId = require("./UserFamily").getSelf;
const dayjs = require("dayjs");
const getApplicationsById = require("./Application").getById;

const { Application } = require("./Application");
const { UserChildren } = require("./UserChildren");
const { ApplicationAYClassSection } = require("./ApplicationAYClassSection");

class Attendance extends Model { }

Attendance.init({
  attendanceId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  checkInApplicationPickupPermissionsId: {
    type: DataTypes.UUID,
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
  checkOutApplicationPickupPermissionsId: {
    type: DataTypes.UUID,
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
  className: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attendanceType: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  createdByUserId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: "Attendance",
  tableName: "Attendance",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

Attendance.belongsTo(Application, {
  foreignKey: "applicationId",
});

Attendance.belongsTo(PickupPermission, {
  foreignKey: "checkInApplicationPickupPermissionsId",
});

Attendance.hasMany(Activity, {
  foreignKey: "attendanceId",
  as: "rowFormData",
});

const joiSchema = JOI.object().keys({
  attendanceId: JOI.string(),
  applicationId: JOI.string(),
  checkInApplicationPickupPermissionsId: JOI.string(),
  checkInConfirmedByUserId: JOI.string(),
  checkInConfirmedDateTime: JOI.date(),
  checkOutApplicationPickupPermissionsId: JOI.string(),
  checkOutDateTime: JOI.date(),
  checkOutConfirmedByUserId: JOI.string(),
  checkOutConfirmedDateTime: JOI.date(),
  className: JOI.string().allow(null).allow(""),
  attendanceType: JOI.number().allow(null),
  createdByUserId: JOI.string(),
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
  const aycsWhereClause = { endDate: { [Op.is]: null } };
  const applWhereClause = { appId: user.appId, tenantId: user.tenantId, orgId: (user.orgId || qry.orgId) };

  if (!qry) {
    console.log("Invalid params, returning []");
    return [];
  }
  // console.log(qry)
  user.userRoles.forEach((role) => {
    // console.log(role.roleName, qry.roleId)
    if (role.roleName == "Staff") {
      if (qry.roleId == role.roleId) {
        console.log(1);
        userHasStaffRole = true;
      }
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);
  console.log(138, qry);

  let tdt = new Date(); let tdtFrom = new Date(); let
    tdtTo = new Date();
  let d1 = dayjs(tdt).format("YYYY-MM-DD");
  let d2 = (dayjs(tdt).add(1, "day")).format("YYYY-MM-DD");

  if (!userHasStaffRole) {
    if (qry.roleId && qry.roleId == appUserRoleId && checkIfValidUUID(qry.applicationId)) {
      whereClause.applicationId = qry.applicationId;
    } else {
      console.log("applicationId null, returning []");
      return [];
    }
  } else {
    if (qry.className && qry.className != "null") {
      whereClause.className = qry.className;
    }
    if (checkIfValidUUID(qry.applicationId)) {
      whereClause.applicationId = qry.applicationId;
    }
    if (qry.classSectionId && qry.classSectionId != "null") {
      aycsWhereClause.classSectionId = qry.classSectionId;
    }
    // whereClause['checkInDateTime'] = { [Op.between]: [d1, d2] }
  }
  // console.log(174, whereClause)
  if (qry.checkInDateTime) {
    if (qry.checkInDateTime) { tdt = new Date(qry.checkInDateTime); } else { tdt = new Date(qry.checkInDateTime); }
    console.log("qry[\"checkInDateTime\"]: ", tdt);
    // if (qry['timeZone'])
    //     tdt = dayjs(tdt).add(qry['timeZone'], 'minute')
    d1 = dayjs(tdt).format("YYYY-MM-DD");
    d2 = (dayjs(tdt).add(1, "day")).format("YYYY-MM-DD");
  }
  if (qry.checkInDateTimeFrom) {
    if (qry.checkInDateTime) { tdtFrom = new Date(qry.checkInDateTimeFrom); } else { tdtFrom = new Date(qry.checkInDateTimeFrom); }
    console.log("qry[\"checkInDateTimeFrom\"]: ", tdtFrom);
    // if (qry['timeZone'])
    //     tdtFrom = dayjs(tdt).add(qry['timeZone'], 'minute')
    d1 = dayjs(tdtFrom).format("YYYY-MM-DD");
    d2 = (dayjs(tdtFrom).add(1, "day")).format("YYYY-MM-DD");
  }
  if (qry.checkInDateTimeTo) {
    if (qry.checkInDateTime) { tdtTo = new Date(qry.checkInDateTimeTo); } else { tdtTo = new Date(qry.checkInDateTimeTo); }
    console.log("qry[\"checkInDateTimeTo\"]: ", tdtTo);
    // if (qry['timeZone'])
    //     tdtTo = dayjs(tdt).add(qry['timeZone'], 'minute')
    d2 = (dayjs(tdtTo).add(1, "day")).format("YYYY-MM-DD");
  }
  // if (qry["checkInDateTimeTo"]) {
  whereClause.checkInDateTime = { [Op.between]: [d1, d2] };
  // }

  console.log(194, whereClause, qry, d1, d2);

  const att = await Attendance.findAll({
    where: whereClause,
    include: [
      { model: Application,
        where: applWhereClause,
        include: [
          { model: UserChildren },
          // {  model: ApplicationAYClassSection,
          //  as: "applicationAYClassSections",
          //  where: aycsWhereClause
          // }
        ],
      },
      { model: PickupPermission },
      { model: Activity, as: "rowFormData" },
    ],
  });
  console.log("attendance: ", 205, JSON.stringify(att));
  return att;
};

const getByPickupPermissionsId = async (id) => {
  const whereClause = {};
  if (id) {
    whereClause.checkInApplicationPickupPermissionsId = id;
  }
  whereClause.checkOutConfirmedDateTime = {
    [Op.is]: null,
  };
  const tdt = new Date();
  const d1 = dayjs(tdt).format("YYYY-MM-DD");
  const d2 = (dayjs(tdt).add(1, "day")).format("YYYY-MM-DD");

  whereClause.checkInDateTime = { [Op.between]: [d1, d2] };
  console.log(198, whereClause);
  return Attendance.findOne({
    where: whereClause,
    order: [["checkInDateTime", "DESC"]],
  });
};

const getById = async (id) => Attendance.findOne({
  where: { attendanceId: id },
});
const create = async (dataIn) => {
  let modelData;
  modelData = Attendance.build(dataIn);
  await modelData.save();
  console.log(dataIn, modelData);

  const activity = await createActivity({
    attendanceId: modelData.attendanceId,
    createdByUserId: modelData.createdByUserId,
    lastUpdatedByUserId: modelData.createdByUserId,
  });
  modelData.dataValues.rowFormData = [activity];
  return modelData;
};

const update = async (dataIn) => {
  const data = await getById(dataIn.attendanceId);
  // only checkout fields. confirmation fields are allowed to be changed as per business rules
  data.checkInConfirmedByUserId = dataIn.checkInConfirmedByUserId ? dataIn.checkInConfirmedByUserId : data.checkInConfirmedByUserId;
  data.checkInConfirmedDateTime = dataIn.checkInConfirmedDateTime ? dataIn.checkInConfirmedDateTime : data.checkInConfirmedDateTime;
  data.checkOutApplicationPickupPermissionsId = dataIn.checkOutApplicationPickupPermissionsId ? dataIn.checkOutApplicationPickupPermissionsId : data.checkOutApplicationPickupPermissionsId;
  data.checkOutDateTime = dataIn.checkOutDateTime ? dataIn.checkOutDateTime : data.checkOutDateTime;
  data.checkOutConfirmedByUserId = dataIn.checkOutConfirmedByUserId ? dataIn.checkOutConfirmedByUserId : data.checkOutConfirmedByUserId;
  data.checkOutConfirmedDateTime = dataIn.checkOutConfirmedDateTime ? dataIn.checkOutConfirmedDateTime : data.checkOutConfirmedDateTime;
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
    if (role.roleName == "Staff") {
      userHasStaffRole = true;
    }
  });
  let userHasTerminalRole = false;
  user.userRoles.forEach((role) => {
    if (role.roleName == "Terminal") {
      userHasTerminalRole = true;
    }
  });

  const tdt = new Date();

  if (dataIn.attendanceType == 0 && dataIn.pickupAuthCodeFull && userHasTerminalRole) { // checkin post call
    const pp = await getByAuthCode(qry.tenantId, qry.appId, qry.orgId, dataIn.pickupAuthCodeFull);
    // console.log('pp: ', pp)
    if (!pp) {
      throw new Error("Validation error: Invalid AuthCode!");
    }
    dataIn = {
      checkInApplicationPickupPermissionsId: pp.applicationPickupPermissionsId,
      applicationId: pp.applicationId,
    };
    dataIn.createdByUserId = userId;

    const d1 = dayjs(new Date()).format("YYYY-MM-DD");
    const d2 = (dayjs(new Date()).add(1, "day")).format("YYYY-MM-DD");
    const whereClause = {};
    whereClause.checkInDateTime = { [Op.between]: [d1, d2] };
    whereClause.applicationId = pp.applicationId;
    whereClause.checkOutConfirmedDateTime = { [Op.is]: null };
    console.log(whereClause);
    const att = await Attendance.findAll({ where: whereClause });
    console.log(att);
    if (att && att.length > 0) {
      return { success: false, message: "Validation error: Already checked in for the day!" };
      // throw new Error(`Validation error: Already checked in for the day!`)
    }
    const appl = await getApplicationsById(qry.tenantId, qry.appId, qry.orgId, user, pp.applicationId);
    if (appl && appl.className) { dataIn.className = appl.className; } else { console.log("appl: ", appl); }
    // dataIn['attendanceId'] = 'D5FF2D3E-D372-492A-9BBE-1967B1F58ED2'
  } else if (dataIn.attendanceType == 1 && userHasStaffRole && id) { // checkin confirmation, put/:id call by staff user
    dataIn = { checkInConfirmedByUserId: userId };
    dataIn.checkInConfirmedDateTime = Date.now();
    // dataIn['checkInApplicationPickupPermissionsId'] = dataIn['checkInApplicationPickupPermissionsId']
    if (id != null) { dataIn.attendanceId = id; }
  } else if (dataIn.attendanceType == 2 && dataIn.pickupAuthCodeFull && userHasTerminalRole) { // checkout put call by user
    const pp = await getByAuthCode(qry.tenantId, qry.appId, qry.orgId, dataIn.pickupAuthCodeFull);
    if (!pp) {
      throw new Error("Validation error: Invalid AuthCode!");
    }
    dataIn = { checkOutApplicationPickupPermissionsId: pp.applicationPickupPermissionsId };
    dataIn.checkOutDateTime = Date.now();
    // dataIn['checkInApplicationPickupPermissionsId'] = dataIn['checkInApplicationPickupPermissionsId']
    const att = await getByPickupPermissionsId(pp.applicationPickupPermissionsId);
    if (att) { dataIn.attendanceId = att.attendanceId; }
  } else if (dataIn.attendanceType == 3 && userHasStaffRole && id) { // checkout confirmation
    dataIn = { checkOutConfirmedByUserId: userId };
    dataIn.checkOutConfirmedDateTime = Date.now();
    // dataIn['checkInApplicationPickupPermissionsId'] = dataIn['checkInApplicationPickupPermissionsId']
    if (id != null) { dataIn.attendanceId = id; }
  } else if (dataIn.attendanceType == 4 && dataIn.applicationId && (userHasTerminalRole || userHasStaffRole)) { // school attendance post call
    dataIn = {
      applicationId: dataIn.applicationId,
      attendanceType: dataIn.attendanceType,
    };
    dataIn.createdByUserId = userId;

    // const appl = await getApplicationsById(qry.tenantId, qry.appId, qry.orgId, user, pp.applicationId)
    // if (appl && appl.className) { dataIn['className'] = appl.className } else { console.log('appl: ', appl) }
  } else if (dataIn.attendanceType == 5 && dataIn.applicationId && (userHasTerminalRole || userHasStaffRole)) { // school attendance post call
    dataIn = {
      applicationId: dataIn.applicationId,
      attendanceType: dataIn.attendanceType,
    };
    dataIn.createdByUserId = userId;

    // const appl = await getApplicationsById(qry.tenantId, qry.appId, qry.orgId, user, pp.applicationId)
    // if (appl && appl.className) { dataIn['className'] = appl.className } else { console.log('appl: ', appl) }
  } else if (dataIn.attendanceType == 6 && dataIn.applicationId && (userHasStaffRole)) { // school attendance post call
    dataIn = {
      applicationId: dataIn.applicationId,
      attendanceType: dataIn.attendanceType,
    };
    dataIn.createdByUserId = userId;

    // const appl = await getApplicationsById(qry.tenantId, qry.appId, qry.orgId, user, pp.applicationId)
    // if (appl && appl.className) { dataIn['className'] = appl.className } else { console.log('appl: ', appl) }
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
  Attendance,
  get,
  create,
  update,
  validate,
};

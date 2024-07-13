const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class StaffLeaveRequest extends Model {
}

StaffLeaveRequest.init({
  staffLeaveRequestId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  leaveReason: {
    type: DataTypes.STRING,
  },
  leaveType: {
    type: DataTypes.STRING,
  },
  leaveFromDate: {
    type: DataTypes.DATE,
  },
  leaveToDate: {
    type: DataTypes.DATE,
  },
  leaveRequestStatus: {
    type: DataTypes.STRING,
  },
  leaveRequestStatusNotes: {
    type: DataTypes.STRING,
  },
  leaveRequestStatusDateTime: {
    type: DataTypes.DATE,
  },
  leaveRequestStatusUpdateUserId: {
    type: DataTypes.UUID,
  },
  createdDateTime: {
    type: DataTypes.DATE,
  },
  lastUpdatedDateTime: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: "StaffLeaveRequest",
  tableName: "StaffLeaveRequests",
  schema: "dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const joiSchema = JOI.object().keys({
  staffLeaveRequestId: JOI.string(),
  tenantId: JOI.string().required(),
  appId: JOI.string().required(),
  orgId: JOI.string().required(),
  userId: JOI.string().required(),
  leaveReason: JOI.string(),
  leaveType: JOI.string(),
  leaveFromDate: JOI.date(),
  leaveToDate: JOI.date(),
  leaveRequestStatusDateTime: JOI.date().allow(null),
  leaveRequestStatus: JOI.string(),
  leaveRequestStatusNotes: JOI.string(),
  leaveRequestStatusUpdateUserId: JOI.string().allow(null),
  lastUpdatedDateTime: JOI.date(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (dataIn, user, qry) => {
  console.log("Creating new Staff Leave Requests");
  // dataIn.userId = user.userId;
  let userHasStaffAdminRole = false;
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if (((role.roleName == "Staff") || (role.roleName == "Support Staff"))
          && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    } else if (role.roleName == "Staff Admin"
          && role.roleId == qry.roleId) {
      userHasStaffAdminRole = true;
    }
  });
  console.log(`userHasStaffAdminRole: ${userHasStaffAdminRole}`);
  console.log(`userHasStaffRole: ${userHasStaffRole}`);
  if (!userHasStaffAdminRole && !userHasStaffRole) {
    throw new Error("Insufficient permissions!");
  }
  if (userHasStaffRole && !userHasStaffAdminRole) {
    dataIn.userId = user.userId;
  }

  const data = StaffLeaveRequest.build(dataIn);
  return await data.save();
};

const getById = async (id) => await StaffLeaveRequest.findByPk(id);
const update = async (dataIn, qry, user) => {
  console.log("StaffLeaveRequest Update: ", dataIn);
  const data = await getById(dataIn.staffLeaveRequestId);
  if (!data) { throw new Error("Invalid staffLeaveRequestId!"); }

  // only appName is allowed to be changed, staffLeaveRequestId is not allowed to change as per business rules
  data.leaveFromDate = dataIn.leaveFromDate ? dataIn.leaveFromDate : data.leaveFromDate;
  data.leaveToDate = dataIn.leaveToDate ? dataIn.leaveToDate : data.leaveToDate;
  data.leaveReason = dataIn.leaveReason ? dataIn.leaveReason : data.leaveReason;
  data.leaveType = dataIn.leaveType ? dataIn.leaveType : data.leaveType;
  if (dataIn.leaveRequestStatus && dataIn.leaveRequestStatus != data.leaveRequestStatus) {
    let userHasStaffAdminRole = false;
    user.userRoles.forEach((role) => {
      if ((role.roleName == "Staff Admin")
              && role.roleId == qry.roleId) {
        userHasStaffAdminRole = true;
      }
    });
    console.log(`userHasStaffAdminRole: ${userHasStaffAdminRole}`);
    if (userHasStaffAdminRole) {
      data.leaveRequestStatus = dataIn.leaveRequestStatus;
      data.leaveRequestStatusNotes = dataIn.leaveRequestStatusNotes ? dataIn.leaveRequestStatusNotes : data.leaveRequestStatusNotes;
      data.leaveRequestStatusDateTime = dataIn.leaveRequestStatusDateTime ? dataIn.leaveRequestStatusDateTime : data.leaveRequestStatusDateTime;
      data.leaveRequestStatusUpdateUserId = user.userId;
    }
  }
  return await data.save();
};
const del = async (id, qry, user) => {
  let userHasStaffAdminRole = false;
  user.userRoles.forEach((role) => {
    if ((role.roleName == "Staff Admin")
            && role.roleId == qry.roleId) {
      userHasStaffAdminRole = true;
    }
  });
  if (userHasStaffAdminRole) {
    	 return await StaffLeaveRequest.destroy({ where: { staffLeaveRequestId: id } });
  }
};

const get = async (qry, user) => {
  let userHasStaffAdminRole = false;
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if (role.roleName == "Staff Admin"
            && role.roleId == qry.roleId) {
      userHasStaffAdminRole = true;
    } else if (((role.roleName == "Staff") || (role.roleName == "Support Staff"))
            && role.roleId == qry.roleId) {
      userHasStaffRole = true;
    }
  });
  console.log(`userHasStaffRole: ${userHasStaffRole}`);
  console.log(`userHasStaffAdminRole: ${userHasStaffAdminRole}`);
  if (!userHasStaffAdminRole && !userHasStaffRole) {
    throw new Error("Insufficient permissions!");
  }

  const whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId };

  if (userHasStaffRole && !userHasStaffAdminRole) {
    whereClause.userId = user.userId;
  }
  return await StaffLeaveRequest.findAll({ where: whereClause });
};
const validate = async (dataIn, id = null) => {
  if (id != null) {
    dataIn.staffLeaveRequestId = id;
    const data = await getById(dataIn.staffLeaveRequestId);
    if (!data) { throw new Error("Invalid staffLeaveRequestId!"); }
  }

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
  StaffLeaveRequest,
  create,
  getById,
  get,
  del,
  update,
  validate,
};

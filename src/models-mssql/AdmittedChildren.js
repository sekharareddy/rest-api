const { Sequelize, DataTypes, Model } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");

class AdmittedChildren extends Model {}

AdmittedChildren.init({
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
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userChildrenId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: true,
    primaryKey: true,
  },
  childEntryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  childExitDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  userChildName: {
    type: DataTypes.STRING,
  },
  applicationNumber: {
    type: DataTypes.NUMBER,
    allowNull: true,
  },
  className: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "AdmittedChildren",
  tableName: "vw_admittedChildren",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

const get = async (tenantId, appId, orgId, user) => {
  const isDeleted = 0;
  const { userId } = user;
  let userHasStaffRole = false;
  user.userRoles.forEach((role) => {
    if (role.roleName == "Staff") {
      userHasStaffRole = true;
    }
  });
  // console.log(`userHasStaffRole: ${userHasStaffRole}`)

  const whereClause = { tenantId, appId, orgId };
  if (!userHasStaffRole) {
    whereClause.userId = userId;
  }
  return AdmittedChildren.findAll({
    where: whereClause,
    order: [["applicationNumber", "ASC"]],
  });
};
module.exports = {
  AdmittedChildren,
  get,
};

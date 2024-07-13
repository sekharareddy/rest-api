const { Sequelize, DataTypes, Model } = require("sequelize");
// const AppUser = require('./AppUser/AppUser');
const sequelize = require("../utils/sequelize");

class ErrorLogs extends Model {}

ErrorLogs.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
  },
  responseCode: {
    type: DataTypes.STRING,
  },
  errorInfo: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: "ErrorLogs",
  tableName: "error_logs",
  timestamps: true,
  createdAt: true,
  updatedAt: true,
});

const postErrorLogs = async (data) => {
  try {
    const errLogs = ErrorLogs.build(data);
    if (!validate(errLogs)) {
      const errResponse = new ErrorResponse(400, "BAD_REQUEST");
      throw errResponse;
    }
    const response = await errLogs.save();
    const queryResult = new QueryResult(response);
    return queryResult;
  } catch (err) {
    return err;
  }
};

const getErrorLogsByRequestId = async (requestId) => {
  const errLogs = await ErrorLogs.findOne({ requestId });
  return errLogs;
};

const getAndUpdateErrorLogsByRequestId = async (requestId, data) => {
  const errLog = await ErrorLogs.findOneAndUpdate(requestId, data);
  return errLog;
};

module.exports = {
  postErrorLogs,
  getErrorLogsByRequestId,
  getAndUpdateErrorLogsByRequestId,
};

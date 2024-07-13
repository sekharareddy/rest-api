const DbConnection = {
  DB_CONNECTED: "Database connected",
  DB_CONNECTION_ERROR: "Error while connecting to Database",

};

const ValidationError = {
  MANDATORY_PARAM_MISSING: "Mandatory Param Missing",
};

const AuthError = {
  INVALID_AUTH_DETAILS: "Invalid authentication Details",
};

const CustomError = {
  CATCH_BLOCK: "Error in Catch BLOCK",
};

const AppError = {
  UNKNOWN_EXCEPTION: "Please contact your administrator",
};

module.exports.DbConnection = { DbConnection, CustomError };
module.exports.TrhsError = { ValidationError, AuthError, AppError };

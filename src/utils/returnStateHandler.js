const HTTP_ = require("./http_codes.json");
const { ErrorResponse } = require("./ErrorResponse");
const utils = require("./utils");
const ErrorLogs = require("../models-mssql/ErrorLogs");

const returnStateHandler = async function (returnState, req, res, next) {
  try {
    const { success } = returnState;
    // console.log(returnState);
    // const state = req.headers.state;
    if (success) {
      const body = utils.removeEmptyValueFromObject(returnState);
      // console.log("Sending success message")
      // body.state = state;
      return res.status(HTTP_.OK).send(body);
    }
    if (returnState.error && returnState.error.message) { returnState.error.message2 = returnState.error.message; }
    console.log("Errors: ", returnState);
    // TODO Replace with App Error codes and error messages...
    // returnState.state = state;
    // console.log(returnState.status)
    // console.log(returnState)
    return res.status(returnState.status).send(returnState);
  } catch (error) {
    console.log("Caught error. Sending error also now", error);

    // const data = {
    //   requestId: req.requestId,
    //   responseCode: res.statusCode,
    //   url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    //   errorInfo: error.errorInfo,
    // };
    // ErrorLogs.postErrorLogs(data)
    const errResponse = new ErrorResponse(returnStateHandler.status, "Interval Server Error", false);
    throw errResponse;
  }
};

module.exports.returnStateHandler = returnStateHandler;

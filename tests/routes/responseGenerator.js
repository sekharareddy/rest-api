function generateSuccessResponse(formData) {
  return {
    success: true,
    formData,
  };
}

function generateErrorResponse(message, status = 400) {
  return {
    error: {
      message2: message,
    },
    status,
  };
}

module.exports = {
  generateSuccessResponse,
  generateErrorResponse,
};

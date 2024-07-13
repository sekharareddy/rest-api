const removeEmptyValueFromObject = (obj) => {
  const objIn = obj;
  Object.keys(objIn).forEach((key) => {
    if (objIn[key] === null) {
      delete objIn[key];
    }
  });
  return objIn;
};

module.exports = {
  removeEmptyValueFromObject,
};

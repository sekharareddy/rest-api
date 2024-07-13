const JOI = require("joi");

const { ElementType } = require("./ElementTypes");

const joiSchema = JOI.object().keys({
  elementTypePropertyId: JOI.string(),
  elementTypeId: JOI.string().required(),
  elementTypePropertyName: JOI.string().required(),
  elementTypePropertyDataType: JOI.string(),
  elementTypePropertyRequired: JOI.boolean(),
  elementTypePropertyDefaultValue: JOI.string(),
  elementTypePropertyOrder: JOI.number(),
  isAdvanced: JOI.boolean(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.elementTypePropertyId = id; } else {
    delete dataIn.elementTypePropertyId;
  }
  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
  } else {
    // // validate foreign keys and any other business requiremets
    const elementType = await ElementType.findOne({ where: { elementTypeId: value.elementTypeId } });
    if (elementType == null) { throw "elementTypeId can not be null!"; }
    return value;
    // return generate(value);
  }
};

// const generate = (dataIn) => {
//   return dataIn;
// }

module.exports = {
  validate,
};

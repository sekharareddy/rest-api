const JOI = require("joi");

const joiSchema = JOI.object().keys({
  fileName: JOI.string(),
  fileURL: JOI.string(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

const create = async (obj) => {
  console.log("add new image to images folder");
};

const getById = async (id) => await Tenant.findByPk(id);
const update = async (dataIn) => {
  const data = await getById(dataIn.tenantId);
  // only appName is allowed to be changed, tenantId is not allowed to change as per business rules
  data.tenantName = dataIn.tenantName ? dataIn.tenantName : data.tenantName;
  return await data.save();
};
const del = async (id) => await Tenant.destroy({ where: { tenantId: id } });

const get = async () => await Tenant.findAll();
const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.tenantId = id; }

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
  create,
  getById,
  get,
  del,
  update,
  validate,
};

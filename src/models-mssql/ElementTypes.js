const { Sequelize, DataTypes, Model, DATE } = require("sequelize");
const JOI = require("joi");
const sequelize = require("../utils/sequelize");
const { ElementTypeProperty } = require("./ElementTypeProperties");

// const { Organization } = require('./Organization');
// const {School} = require('./School');
// const {ElementTypeProperty} = require('./ElementTypeProperties');

class ElementType extends Sequelize.Model {}

ElementType.init(
  {
    elementTypeId: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    elementTypeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    elementCSSLibraryName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    defaultParentLevel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastUpdateDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ElementType",
    tableName: "elementTypes",
    schema: "crm",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  },
);

const joiSchema = JOI.object().keys({
  elementTypeId: JOI.string(),
  elementTypeName: JOI.string().required(),
  elementCSSLibraryName: JOI.string(),
  defaultParentLevel: JOI.string().required(),
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

ElementType.hasMany(ElementTypeProperty, {
  foreignKey: "elementTypeId",
  as: "rowFormData",
});

const create = async (dataIn) =>
// const modelData = ElementType.build(dataIn);
	 await ElementType.create(dataIn)
// if (dataIn["defaultParentLevel"] && dataIn["defaultParentLevel"]) == 'APP'{
//
// }
;

const getById = async (id) => {
  const data = await ElementType.findOne({
    where: { elementTypeId: id },
    include: [
      {
        model: ElementTypeProperty,
        as: "rowFormData",
      },
    ],
  });
  return data;
};

const get = async (defaultParentLevel = null) => {
  let data;
  if (defaultParentLevel !== null) {
    data = await ElementType.findAll({
      where: { defaultParentLevel },
      include: [
        {
          model: ElementTypeProperty,
          as: "rowFormData",
        },
      ],
    });
  } else {
    data = await ElementType.findAll({
      // where:{defaultParentLevel},
      include: [
        {
          model: ElementTypeProperty,
          as: "rowFormData",
        },
      ],
    });
  }
  return data;
};

const update = async (dataIn) => {
  const data = await getById(dataIn.elementTypeId);

  data.elementTypeName = dataIn.elementTypeName
    ? dataIn.elementTypeName
    : data.elementTypeName;
  data.elementCSSLibraryName = dataIn.elementCSSLibraryName
    ? dataIn.elementCSSLibraryName
    : data.elementCSSLibraryName;
  data.defaultParentLevel = dataIn.defaultParentLevel
    ? dataIn.defaultParentLevel
    : data.defaultParentLevel;

  return await data.save();
};

const del = async (id) => await ElementType.destroy({ where: { elementTypeId: id } });

const validate = async (dataIn, id = null) => {
  if (id != null) { dataIn.elementTypeId = id; }

  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw `Validation error: ${error.details.map((x) => x.message).join(", ")}`;
  } else {
    // validate foreign keys and any other business requiremets

    return value;
    // return generate(value);
  }
};

// const generate = (dataIn) => {
//   return dataIn;
// }

module.exports = {
  ElementType,
  create,
  update,
  get,
  getById,
  del,
  validate,
};

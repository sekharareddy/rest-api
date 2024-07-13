const { Sequelize, DataTypes, Model } = require('sequelize');
const JOI = require('joi');

const schema = [
	{
		routeName: "App",
		modelName: "App",
		initSchema: {
			appId: {
				type: DataTypes.UUID,
				defaultValue: Sequelize.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			tenantId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			appName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			lastUpdateDateTime: {
				type: DataTypes.DATE,
				allowNull: true,
			},
		},
    tableName:"Apps",
    joiSchema:{
      appId: JOI.string(),
      tenantId: JOI.string().required(),
      appName: JOI.string().required(),
      lastUpdateDateTime: JOI.date(),
      rowFormData: JOI.array()
    },
    functions:[
      {
        hasMany:"AppElement",
        param:{
          foreignKey:'appId',
          as:'rowFormData'
        }
      },
      {
        belongsTo:"Tenant",
        param:{
          foreignKey:'tenantId'
        }
      }
    ],
    rowform:true,
    rowFormData:{}
	},
];

module.exports = {
	schema,
};

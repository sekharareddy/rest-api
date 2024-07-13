const { Sequelize, DataTypes, Model, QueryTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const JOI = require('joi');

// const { vwSyllabusCombinationSubject } = require('./SyllabusCombinationSubject');
// const { SyllabusCombination } = require('./SyllabusCombination');
// const { ClassSections } = require('./ClassSections');

class ClassSectionSyllabusClassCombinations extends Model{
}

ClassSectionSyllabusClassCombinations.init({
  ClassSectionSyllabusClassCombinationId:{
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4, 
    allowNull: false,
    primaryKey: true
  },
  syllabusCombinationId:{
    type: DataTypes.UUID,
    allowNull:false
  },
  classId:{
    type:DataTypes.UUID,
    allowNull: false
  },
  classSectionId:{
    type:DataTypes.UUID,
    allowNull: false
  },
  createdDateTime:{
    type:DataTypes.DATE
  },
  lastUpdatedDateTime:{
    type:DataTypes.DATE
  },
  orgId: {
        type: DataTypes.UUID,
        allowNull: false
    },
  tenantId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    appId: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
  sequelize, 
  modelName: 'ClassSectionSyllabusClassCombinations',
  tableName: 'ClassSectionSyllabusClassCombinations',
  schema:"dbo",
  timestamps: false,
  createdAt: false,
  updatedAt: false,
})

// ClassSections.belongsToMany(SyllabusCombination, {
//   through: ClassSectionSyllabusClassCombinations,
//   foreignKey: "syllabusCombinationId",
//     as: 'syllabusCombinations'
// })
// 
// SyllabusCombination.hasMany(vwSyllabusCombinationSubject, {
//     foreignKey: "syllabusCombinationId",
//     as: 'syllabusCombinationSubjects'
// });


const joiSchema = JOI.object().keys({
  ClassSectionSyllabusClassCombinationId: JOI.string(),
  syllabusCombinationId: JOI.string(),
  classId: JOI.string().required(),
  classSectionId: JOI.string().required(),
  lastUpdatedDateTime: JOI.date(),
  orgId: JOI.string().required(),
  tenantId: JOI.string().required(),
    appId: JOI.string().required()
});
// Joi validation options
const JOIvalidationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true // remove unknown keys from the validated data
};

const create = async(obj)=>{
  console.log("Creating new ClassSectionSyllabusClassCombination");
  const  o = ClassSectionSyllabusClassCombinations.build(obj);
  return await o.save();
}

const getById = async(id)=>{
  return await ClassSectionSyllabusClassCombinations.findByPk(id)
}
const update = async (dataIn) =>{
  console.log("ClassSectionSyllabusClassCombinations Update: ",dataIn)
  const data = await getById(dataIn.ClassSectionSyllabusClassCombinationId);
  // only appName is allowed to be changed, ClassSectionSyllabusClassCombinationId is not allowed to change as per business rules
  data.ClassSectionSyllabusClassCombinationId = dataIn.ClassSectionSyllabusClassCombinationId?dataIn.ClassSectionSyllabusClassCombinationId:data.ClassSectionSyllabusClassCombinationId;
  data.syllabusCombinationId = dataIn.syllabusCombinationId?dataIn.syllabusCombinationId:data.syllabusCombinationId;
  data.classId = dataIn.classId?dataIn.classId:data.classId;
  data.classSectionId = dataIn.classSectionId?dataIn.classSectionId:data.classSectionId;
  return await data.save();
}
const del = async (id) => {
	return await ClassSectionSyllabusClassCombinations.destroy({ where: { ClassSectionSyllabusClassCombinationId: id } });
};

const getSubjects = async (qry, user) => {
  let userHasStaffRole = false;
    user.userRoles.forEach(role => {
        if ((role.roleName == 'Staff' || role.roleName == 'Support Staff')
            && role.roleId == qry.roleId) {
            userHasStaffRole = true
        }
    });
    console.log(`userHasStaffRole: ${userHasStaffRole}`)
    const strQuery = 'select distinct scc.*, scs.syllabusCombinationSubjectId, scs.subjectId, s.subjectName, s.subjectCode, s.subjectShortName ' 
              + 'from ClassSectionSyllabusClassCombinations scc join vw_syllabusCombinationSubjects scs on scs.syllabusCombinationId = scc.syllabusCombinationId ' 
              + 'join subjects s  on scs.subjectId = s.subjectId ' 
              + 'where scc.tenantId = ? and scc.appId = ? and scc.orgId = ? and scc.classSectionId = ? '
    const data = await sequelize.query(strQuery,
        {
            replacements: [qry.tenantId, qry.appId, qry.orgId, qry.classSectionId],
            type: QueryTypes.SELECT
        }
    );
 
  return data;
}

const get = async (qry, user) => {
  let userHasStaffRole = false;
    user.userRoles.forEach(role => {
        if ((role.roleName == 'Staff' || role.roleName == 'Support Staff')
            && role.roleId == qry.roleId) {
            userHasStaffRole = true
        }
    });
    console.log(`userHasStaffRole: ${userHasStaffRole}`)
    let whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId }
    if (qry?.classSectionId){
      whereClause['classSectionId'] = qry?.classSectionId       
    }
    
    const data = await ClassSectionSyllabusClassCombinations.findAll({
        where:whereClause
    })
 
  return data;
}
const validate = async (dataIn, id=null) => {
  if (id != null) dataIn.ClassSectionSyllabusClassCombinationId = id;
  
  console.log(dataIn)
  const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
  if (error) {
    throw `Validation error: ${error.details.map(x => x.message).join(', ')}`;
  } else {
    // validate foreign keys and any other business requiremets

    return value;
    // return generate(value);
  }  
}

module.exports = {
  ClassSectionSyllabusClassCombinations,
  create,
  getById,
  get,
  getSubjects,
  del,
  update,
  validate
}
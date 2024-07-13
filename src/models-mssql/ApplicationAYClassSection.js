const { Sequelize, DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../utils/sequelize');
const JOI = require('joi');

class ApplicationAYClassSection extends Model {
}

ApplicationAYClassSection.init({
    applicationAYClassSectionId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    applicationId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    academicYearId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    classSectionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE
    },
    endDate: {
        type: DataTypes.DATE
    },
    ApplicationAYClassSectionRollNumber: {
        type: DataTypes.NUMBER
    },
    AY_TotalFee: {
        type: DataTypes.NUMBER
    },
    AY_External_ScholarShips: {
        type: DataTypes.NUMBER
    },
    AY_External_ScholarshipsNotes: {
        type: DataTypes.STRING
    },
    createdDateTime: {
        type: DataTypes.DATE
    },
    lastUpdatedDateTime: {
        type: DataTypes.DATE
    }
}, {
    sequelize,
    modelName: 'ApplicationAYClassSection',
    tableName: 'applicationAYClassSections',
    schema: "dbo",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
})

const joiSchema = JOI.object().keys({
    applicationAYClassSectionId: JOI.string(),
    applicationId: JOI.string().required(),
    academicYearId: JOI.string().required(),
    classSectionId: JOI.string().required(),
    startDate: JOI.date(),
    endDate: JOI.date(),
    ApplicationAYClassSectionRollNumber: JOI.number().allow(null),
    AY_TotalFee: JOI.number().allow(null),
    AY_External_ScholarShips: JOI.number().allow(null),
    AY_External_ScholarshipsNotes: JOI.string().allow(null),
    lastUpdatedDateTime: JOI.date()
});
// Joi validation options
const JOIvalidationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true // remove unknown keys from the validated data
};

const create = async (obj) => {
    console.log("Creating new ApplicationAYClassSection");
    if (!obj.ApplicationAYClassSectionRollNumber) {
        let maxRec = await ApplicationAYClassSection.findAll({
            where: {
                classSectionId: obj.classSectionId,
                academicYearId: obj.academicYearId,
                endDate: { [Op.eq]: null }
            },
            attributes: [
                [sequelize.fn('count', sequelize.col('applicationId')), 'totalApplications'],
                [sequelize.fn('max', sequelize.col('ApplicationAYClassSectionRollNumber')), 'maxApplicationAYClassSectionRollNumber']
            ]
        })
        let maxApplicationAYClassSectionRollNumber = 1;
        if (maxRec && maxRec[0]?.dataValues?.maxApplicationAYClassSectionRollNumber) {
            if (maxRec[0]?.dataValues?.maxApplicationAYClassSectionRollNumber >= maxRec[0]?.dataValues?.totalApplications)
                maxApplicationAYClassSectionRollNumber = maxRec[0]?.dataValues?.maxApplicationAYClassSectionRollNumber + 1;
            else
                maxApplicationAYClassSectionRollNumber = maxRec[0]?.dataValues?.totalApplications + 1
        }
        obj.ApplicationAYClassSectionRollNumber = maxApplicationAYClassSectionRollNumber;
    }

    const o = ApplicationAYClassSection.build(obj);
    return await o.save();
}

const getById = async (id) => {
    return await ApplicationAYClassSection.findByPk(id)
}
const update = async (dataIn) => {
    console.log("ApplicationAYClassSection Update: ", dataIn)
    const data = await getById(dataIn.applicationAYClassSectionId);
    // only appName is allowed to be changed, applicationAYClassSectionId is not allowed to change as per business rules
    data.applicationId = dataIn.applicationId ? dataIn.applicationId : data.applicationId;
    data.academicYearId = dataIn.academicYearId ? dataIn.academicYearId : data.academicYearId;
    data.classSectionId = dataIn.classSectionId ? dataIn.classSectionId : data.classSectionId;
    data.startDate = dataIn.startDate ? dataIn.startDate : data.startDate;
    data.endDate = dataIn.endDate ? dataIn.endDate : data.endDate;
    data.ApplicationAYClassSectionRollNumber = dataIn.ApplicationAYClassSectionRollNumber ? dataIn.ApplicationAYClassSectionRollNumber : data.ApplicationAYClassSectionRollNumber;
    data.AY_TotalFee = dataIn.AY_TotalFee ? dataIn.AY_TotalFee : data.AY_TotalFee;
    data.AY_External_ScholarShips = dataIn.AY_External_ScholarShips ? dataIn.AY_External_ScholarShips : data.AY_External_ScholarShips;
    data.AY_External_ScholarshipsNotes = dataIn.AY_External_ScholarshipsNotes ? dataIn.AY_External_ScholarshipsNotes : data.AY_External_ScholarshipsNotes;
    return await data.save();
}

const del = async (id) => {
    return await ApplicationAYClassSection.destroy({ where: { applicationAYClassSectionId: id } });
};

const get = async (qry, user) => {
    let userHasStaffRole = false;
    user.userRoles.forEach(role => {
        if ((role.roleName == 'Staff' || role.roleName == 'Support Staff')
            && role.roleId == qry.roleId) {
            userHasStaffRole = true
        }
    });
    console.log(`103: userHasStaffRole: ${userHasStaffRole}`)
    // let whereClause = {}
    // // let whereClause = { tenantId: qry.tenantId, appId: qry.appId, orgId: qry.orgId }
    // if (qry.hasOwnProperty('active') & qry.active == 0 ) 
    //   whereClause['endDate'] = { [Op.ne]: null }
    // else 
    //   whereClause['endDate'] = { [Op.eq]: null }
    // if (qry.applicationId) whereClause.applicationId = qry.applicationId
    // if (qry.academicYearId) whereClause.academicYearId = qry.academicYearId
    // if (qry.classSectionId) whereClause.classSectionId = qry.classSectionId
    // console.log(113, qry, whereClause)
    // return await ApplicationAYClassSection.findAll(
    //   { where: whereClause,
    //     include:[
    //       {
    //         model:UserChildren, 
    //         as:"userChildren"
    //       }
    //     ]
    //   }
    // )
    let sql = "Select * from vw_applicationAYClassSections where orgId = '" + qry.orgId + "' "
    if (qry.hasOwnProperty('active') & qry.active == 0)
        sql = sql + " and endDate is not null "
    else
        sql = sql + " and endDate is null "

    if (qry.applicationId) sql = sql + " and applicationId = '" + qry.applicationId + "' "
    if (qry.academicYearId) sql = sql + " and academicYearId = '" + qry.academicYearId + "' "
    if (qry.classSectionId) sql = sql + " and classSectionId = '" + qry.classSectionId + "' "
    return await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });    
}

const validate = async (dataIn, id = null) => {
    if (id != null) dataIn.applicationAYClassSectionId = id;
    if (dataIn.endDate === null || dataIn.endDate === '' || dataIn.endDate === 'Invalid Date')
        delete dataIn['endDate']
    const { error, value } = joiSchema.validate(dataIn, JOIvalidationOptions);
    if (error) {
        throw `Validation error: ${error.details.map(x => x.message).join(', ')}`;
    } else {
        // validate foreign keys and any other business requiremets
        if (!dataIn.applicationAYClassSectionId) {    // POST call validation
            let recs = await ApplicationAYClassSection.findAll({
                where: {
                    classSectionId: dataIn.classSectionId,
                    academicYearId: dataIn.academicYearId,
                    applicationId: dataIn.applicationId,
                    endDate: { [Op.eq]: null }
                }
            });
            if (recs && recs.length > 0) {
                throw `Validation error: valid classSection/AcademicYear record for the applicationId exists!`;
            }
        }
        if (dataIn.ApplicationAYClassSectionRollNumber) {
            let recs = await ApplicationAYClassSection.findAll({
                where: {
                    classSectionId: dataIn.classSectionId,
                    academicYearId: dataIn.academicYearId,
                    ApplicationAYClassSectionRollNumber: dataIn?.ApplicationAYClassSectionRollNumber,
                    endDate: { [Op.ne]: null }
                }
            });
            if (recs && recs.length > 0) {
                if (recs[0].dataValues.applicationId != dataIn.applicationId)
                    throw `Validation error: ApplicationAYClassSectionRollNumber already assigned to another student!`;
            }
        }

        return value;
        // return generate(value);
    }
}

module.exports = {
    ApplicationAYClassSection,
    create,
    getById,
    get,
    del,
    update,
    validate
}
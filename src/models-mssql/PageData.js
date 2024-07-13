const { QueryTypes } = require("sequelize");
const sequelize = require("../utils/sequelize");
// Validate Input params from Joi Schema

const fnFindOne = async (tenantId, appId, pageName, publishStatus) => {
  const o = await sequelize.query(
    "select pageData from vw_Pages where tenantId = ? and appId = ? and pageName = ? and publishStatus = ?",
    {
      replacements: [tenantId, appId, pageName, publishStatus],
      query: QueryTypes.SELECT,
    },
  );
  return o[0][0];
};

const fnFindOneById = async (tenantId, appId, pageId, publishStatus) => {
  const o = await sequelize.query(
    "select pageData from vw_Pages where tenantId = ? and appId = ? and pageId = ? and publishStatus = ?",
    {
      replacements: [tenantId, appId, pageId, publishStatus],
      query: QueryTypes.SELECT,
    },
  );
  return o[0][0];
};

module.exports = {
  fnFindOne,
  fnFindOneById,
};

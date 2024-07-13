const { QueryTypes } = require("sequelize");
const sequelize = require("../utils/sequelize");

const fnFindOne = async (tenantId, appId) => {
  const o = await sequelize.query(
    "select tenantId,	appId,	appName, siteData,	routesData,	appElementsData from vw_Apps where tenantId = ? and appId = ?",
    {
      replacements: [tenantId, appId],
      type: QueryTypes.SELECT,
    },
  );
  return o;
};

module.exports = {
  fnFindOne,
};

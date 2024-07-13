const fs = require("fs");

const writing = async (data, key, value) => {
  // console.log(`******* writing value to file ${key} ${value}`)
  console.log(`**************** Writing key ${key} and value ${value}`);
  if (key != undefined) { data[key] = value; }
  data = JSON.stringify(data);
  await fs.writeFileSync("./test/db.json", data);
};

const readDB = () => {
  const data = fs.readFileSync("./test/db.json");
  return JSON.parse(data);
};

module.exports = { writing, readDB };

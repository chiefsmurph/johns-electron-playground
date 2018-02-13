const fs = require('mz/fs');
const jsonMgr = require('../utils/json-mgr');

module.exports = async (strategy, min, picks) => {

  const dateStr = (new Date()).toLocaleDateString();
  const fileLocation = `./picks-data/${dateStr}/${strategy}.json`;
  // create day directory if needed
  if (!(await fs.exists(`./picks-data/${dateStr}`))) {
    await fs.mkdir(`./picks-data/${dateStr}`);
  }
  const curData = await jsonMgr.get(fileLocation);
  const savedData = {
    ...curData,
    [min]: picks
  };
  await jsonMgr.save(fileLocation, savedData);

};

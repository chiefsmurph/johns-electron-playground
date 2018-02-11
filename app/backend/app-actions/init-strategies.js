const fs = require('mz/fs');
const path = require('path');

const strategies = [];

module.exports = async (Robinhood) => {

  var normalizedPath = path.join(__dirname, '../strategies');

  const files = (await fs.readdir(normalizedPath))
    .filter(fileName => !fileName.startsWith('.'))
    .map(fileName => `${normalizedPath}/${fileName}`);

  for (let file of files) {
    const isDir = (await fs.lstat(file)).isDirectory();
    if (!isDir) {
      const strategyObj = require(file);
      strategyObj.init(Robinhood);
      strategies.push(strategyObj);
    }
  }

};

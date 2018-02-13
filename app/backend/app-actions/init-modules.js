const fs = require('mz/fs');
const path = require('path');
const trd = require('../modules/before-close-up');

const modules = [];

module.exports = async (Robinhood) => {

  const remote = require('electron').remote;
  const appPath = process.env.NODE_ENV === 'production' ? remote.app.getAppPath() : __dirname
  var normalizedPath = path.join(appPath, './backend/modules');

  const files = (await fs.readdir(normalizedPath))
    .filter(fileName => !fileName.startsWith('.'))
    .map(fileName => `${normalizedPath}/${fileName}`);

  console.log('files', files);
  for (let file of files) {
    try {
      const moduleObj = require(`../modules/${file.split('/').pop()}`);
      moduleObj.init(Robinhood);
      modules.push(moduleObj);
    } catch (e) {
      console.log(`../modules/${file.split('/').pop()}`, file.split('/').pop(), file, e);
    }
  }

};

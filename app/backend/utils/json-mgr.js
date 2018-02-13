const remote = require('electron').remote;
const appPath = process.env.NODE_ENV === 'production' ? remote.app.getAppPath() : __dirname
const path = require('path');

const fs = require('mz/fs');

module.exports = {
  get: async (file) => {
    try {
      const fullPath = path.join(appPath, file);
      return JSON.parse(await fs.readFile(fullPath, 'utf8'));
    } catch (e) {
      return null;
    }
  },
  save: async (file, obj) => {
    const fullPath = path.join(appPath, file);
    await fs.writeFile(fullPath, JSON.stringify(obj, null, 2));
  }
};

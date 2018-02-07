const fs = require('mz/fs');
const recursiveUrl = require('./recursive-url');

const pmJsonStorage = require('../../utils/pm-json-storage');

const saveJSON = async (fileName, obj) => {
  await fs.writeFile(fileName, JSON.stringify(obj, null, 2));
};

const getAllTickers = async (Robinhood) => {
  console.log('getting all tickers...');
  const allResults = await recursiveUrl(Robinhood, 'https://api.robinhood.com/instruments/');
  // await saveJSON('./stock-data/allStocks.json', allResults);
  await pmJsonStorage.set('allTickers', allResults);
  return allResults;
};

module.exports = getAllTickers;

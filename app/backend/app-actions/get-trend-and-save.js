const getTrendSinceOpen = require('../rh-actions/get-trend-since-open');
const jsonMgr = require('../utils/json-mgr');

const pmJsonStorage = require('../../utils/pm-json-storage');

const getAllTickers = require('../rh-actions/get-all-tickers');

const getTrendAndSave = async (Robinhood, min) => {

  min = min || (() => {

  var sixthirty = new Date();
  sixthirty.setHours(6);
  sixthirty.setMinutes(30);
  var now = new Date();
  var diffMs = now - sixthirty;
  var diffMins = diffMs / 60000;
  return Math.round(diffMins);

  })();

  // step 1 - get all tickers
  let allTickers = await pmJsonStorage.get('allTickers');
  console.log('afefefell', allTickers);
  if (!allTickers || !Object.keys(allTickers).length) {
  allTickers = await getAllTickers(Robinhood);
  }

  allTickers = allTickers
  .filter(stock => stock.tradeable)
  .map(stock => stock.symbol);

  // step 2 - get trend
  console.log(`getting trend since open for all stocks - 6:31am + ${min} minutes`);
  const trendingArray = await getTrendSinceOpen(Robinhood, allTickers);
  const dateStr = (new Date()).toLocaleString();

  // step 3 - save trend
  // await jsonMgr.save(`./stock-data/.json`, trendingArray);
  console.log('hereeeee')
  const curStockData = await pmJsonStorage.get('stockData') || {};
  curStockData[`${dateStr} (+${min})`] = trendingArray;
  console.log(curStockData, 'asd');
  await pmJsonStorage.set('stockData', curStockData);

  console.log('done getting trend');

  return trendingArray;

};

module.exports = getTrendAndSave;

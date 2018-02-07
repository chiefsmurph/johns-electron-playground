const jsonMgr = require('../utils/json-mgr');
// const scrapeYahooPrice = require('../app-actions/scrape-yahoo-price');
const lookup = require('../utils/lookup');

const boughtThisStockToday = async ticker => {
  const fileName = `./daily-transactions/${(new Date()).toLocaleDateString()}.json`;
  const curTransactions = await jsonMgr.get(fileName) || [];
  return curTransactions.some(transaction => {
  return transaction.ticker === ticker && transaction.type === 'buy';
  });
};

module.exports = async (Robinhood, {
  ticker,
  quantity = 1,
  bidPrice
}) => {
  console.log('limit selling', ticker);

  if (await boughtThisStockToday(ticker)) {
  console.log('not selling ', ticker, 'because bought today');
  return null;
  }

  const {
  currentPrice,
  instrument
  } = (await lookup(ticker, Robinhood));
  bidPrice = bidPrice || currentPrice;

  bidPrice = +(Number(bidPrice).toFixed(2));

  var options = {
  type: 'limit',
  quantity,
  bid_price: bidPrice,
  instrument: {
    url: instrument,
    symbol: ticker
  }
  // // Optional:
  // trigger: String, // Defaults to "gfd" (Good For Day)
  // time: String,  // Defaults to "immediate"
  // type: String   // Defaults to "market"
  };

  console.log(options);
  const res = await Robinhood.place_sell_order(options);
  // console.log(res, 'res')
  return res;
};

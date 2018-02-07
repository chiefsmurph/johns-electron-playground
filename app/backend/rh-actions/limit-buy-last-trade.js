const jsonMgr = require('../utils/json-mgr');
// const avgArray = require('../utils/avg-array');

// const scrapeYahooPrice = require('../app-actions/scrape-yahoo-price');
const lookup = require('../utils/lookup');

const alreadySoldThisStockToday = async ticker => {
  const fileName = `./daily-transactions/${(new Date()).toLocaleDateString()}.json`;
  const curTransactions = await jsonMgr.get(fileName) || [];
  return curTransactions.some(transaction => {
  return transaction.ticker === ticker && transaction.type === 'sell';
  });
};

const limitBuyLastTrade = async (Robinhood, { ticker, maxPrice, quantity, bidPrice }) => {

  try {

  if (await alreadySoldThisStockToday(ticker)) {
    console.log('not purchasing ', ticker, 'because already sold today');
    return;
  }

  console.log('limit buying', ticker);



  const quoteData = await Robinhood.quote_data(ticker);

  //
  // const impNums = [
  //   askPrice,
  //   lastTrade
  // ].map(val => Number(val)).filter(val => val > 0);
  //
  // let bidPrice = avgArray(impNums);
  const {
    currentPrice,
    instrument
  } = (await lookup(ticker, Robinhood));
  bidPrice = bidPrice || currentPrice;

  bidPrice = +(Number(bidPrice).toFixed(2));

  if (!quantity) {
    quantity = Math.floor(maxPrice / bidPrice);
  }
  console.log('bidPrice', bidPrice);
  console.log('maxPrice', maxPrice);
  console.log('quanity', quantity);

  if (!quantity || !bidPrice) return;

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
  const res = await Robinhood.place_buy_order(options);
  console.log('res', res);
  return res;

  } catch (e) {
  return null;
  }

};

module.exports = limitBuyLastTrade;

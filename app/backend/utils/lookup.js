// lookup ticker last trade price
// ticker -> {
//   last_trade_price,
//   previous_close,
//   yahooPrice,
//   instrument
// }
const { lookup } = require('yahoo-stocks');

module.exports = async (ticker, Robinhood) => {
  if (!ticker) return;
  let data = {};
  try {
    const quoteData = await Robinhood.quote_data(ticker);
    const { last_trade_price, previous_close, instrument } = quoteData.results[0];
    data = {
      lastTrade: Number(last_trade_price),
      prevClose: Number(previous_close),
      instrument
    };
  } catch (e) {
    console.log(e, 'efae')
  }

  try {
    let yahooPrice = (await lookup(ticker)).currentPrice;
    data = {
      ...data,
      yahooPrice,
      currentPrice: data.lastTrade || yahooPrice
    };
    return data;
  } catch (e) {
    return data;
  }

};

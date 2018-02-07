// pass an array of tickers or a single ticker string

// npm
const mapLimit = require('promise-map-limit');

// utils
const getTrend = require('../utils/get-trend');

const getTrendSinceOpen = {
  single: async (Robinhood, ticker) => {

  try {
    var [fundamentals, quote_data] = await Promise.all([
    Robinhood.fundamentals(ticker),
    Robinhood.quote_data(ticker)
    ]);
    fundamentals = fundamentals.results[0];
    quote_data = quote_data.results[0];
  } catch (e) {
    console.log(e, 'error getting trend', ticker);
    return {};
  }

  const { open } = fundamentals;
  const { last_trade_price, previous_close } = quote_data;

  return {
    fundamentals,
    quote_data,
    open,
    last_trade_price,
    // previous_close,
    trend_since_open: getTrend(last_trade_price, open),
    trend_since_prev_close: getTrend(last_trade_price, previous_close)
  };
  },
  multiple: async (Robinhood, stocks) => {

  var timer = (() => {
    const start = new Date();
    return {
    stop: function() {
      const end = new Date();
      const time = end.getTime() - start.getTime();
      return time;
    }
    };
  })();

  let curIndex = 0;
  let result = await mapLimit(stocks, 20, async ticker => {
    curIndex++;
    console.log(
    'getting trend',
    curIndex + ' of ' + stocks.length,
    ticker
    );
    try {
    const trend = await getTrendSinceOpen.single(Robinhood, ticker);
    console.log(trend, 'trend');
    return {
      ticker,
      ...trend
    };
    } catch (e) {
    return {
      ticker
    }
    }

  });

  result = result
    .filter(obj => obj.trend_since_open)
    .sort((a, b) => b.trend_since_open - a.trend_since_open);

  // console.log('result', result);
  const length = timer.stop();
  console.log('time', length, length / stocks.length);

  return result;
  }
};

module.exports = async (Robinhood, input) => {
  if (Array.isArray(input)) {
  return await getTrendSinceOpen.multiple(Robinhood, input);
  } else {
  return await getTrendSinceOpen.single(Robinhood, input);
  }
};

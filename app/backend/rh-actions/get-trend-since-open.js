// pass an array of tickers or a single ticker string

// npm
const mapLimit = require('promise-map-limit');

// utils
const getTrend = require('../utils/get-trend');



const splitIntoChunks = (array, size) => {
  const cloned = array.slice();
  var splitUp = [];
  while (cloned.length > 0)
    splitUp.push(cloned.splice(0, size));
  return splitUp;
};

function flatten(array) {
  return array.reduce((r, e) => Array.isArray(e) ? r = r.concat(flatten(e)) : r.push(e) && r, [])
}

const getTrendSinceOpen = {
  single: async (Robinhood, ticker) => {
    console.log('tick', ticker);
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


    let withQuotes = await mapLimit(splitIntoChunks(stocks, 1630), 1, async collection => {
      const { results } = await Robinhood.url(`https://api.robinhood.com/quotes/?symbols=${collection.join(',')}`);
      console.log(results);
      return results.map((quoteData, i) => {
        if (!quoteData) {
          console.log('ticker no good', collection[i]);
        }
        quoteData = quoteData || {};
        return {
          ticker: collection[i],
          quote_data: quoteData,
          last_trade_price: Number(quoteData.last_trade_price),
          previous_close: Number(quoteData.previous_close),
          trend_since_prev_close: getTrend(quoteData.last_trade_price, quoteData.previous_close)
        };
      });
    });

    withQuotes = flatten(withQuotes);

    console.log(withQuotes, 'withQuotes');

    return withQuotes;

    // let withFundamentals = await mapLimit(splitIntoChunks(withQuotes, 10), 1, async collection => {
    //   const tickers = collection.map(obj => obj.ticker);
    //   const { results } = await Robinhood.url(`https://api.robinhood.com/fundamentals/?symbols=${tickers.join(',')}`);
    //   console.log(results);
    //   return results.map((fundamentals, i) => {
    //     fundamentals = fundamentals || {};
    //     return {
    //       ...collection[i],
    //       fundamentals,
    //       open: fundamentals.open,
    //       trend_since_open: getTrend(collection[i].last_trade_price, fundamentals.open),
    //     };
    //   });
    // });
    //
    // withFundamentals = flatten(withFundamentals);
    // console.log(withFundamentals, 'withFundamentals');


    // var timer = (() => {
    //   const start = new Date();
    //   return {
    //     stop: function() {
    //       const end = new Date();
    //       const time = end.getTime() - start.getTime();
    //       return time;
    //     }
    //   };
    // })();

    // let curIndex = 0;
    // let result = await mapLimit(stocks, 20, async ticker => {
    //   curIndex++;
    //   console.log(
    //     'getting trend',
    //     curIndex + ' of ' + stocks.length,
    //     ticker
    //   );
    //   try {
    //     const trend = await getTrendSinceOpen.single(Robinhood, ticker);
    //     console.log(trend, 'trend');
    //     return {
    //       ticker,
    //       ...trend
    //     };
    //   } catch (e) {
    //     return {
    //       ticker
    //     }
    //   }
    //
    // });
    //
    // result = result
    //   .filter(obj => obj.trend_since_open)
    //   .sort((a, b) => b.trend_since_open - a.trend_since_open);

    // console.log('result', result);
    // const length = timer.stop();
    // console.log('time', length, length / stocks.length);

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

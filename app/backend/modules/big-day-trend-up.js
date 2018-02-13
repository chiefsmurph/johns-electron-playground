const DISABLED = true; // records picks but does not purchase

// utils
const regCronIncAfterSixThirty = require('../utils/reg-cron-after-630');

// app-actions
const executeStrategy = require('../app-actions/execute-strategy');

// npm
const mapLimit = require('promise-map-limit');

// rh-actions
const getRisk = require('../rh-actions/get-risk');
// const trendingUp = require('../rh-actions/trending-up');

const trendFilter = async (Robinhood, trend) => {
  // cheap stocks that are going up the most for the day

  console.log('running big-day-trend-up strategy');

  console.log('total trend stocks', trend.length);
  const allUp = trend.filter(
    stock => stock.trend_since_open && stock.trend_since_open > 3
  );
  console.log('trendingUp', allUp.length);
  let cheapBuys = allUp.filter(stock => {
    return Number(stock.quote_data.last_trade_price) < 30;
  });
  console.log('trading below $30', cheapBuys.length);

  cheapBuys = await mapLimit(cheapBuys, 20, async buy => ({
    ...buy,
    ...(await getRisk(Robinhood, buy.ticker)),
  }));

  console.log(
    'num watcout',
    cheapBuys.filter(buy => buy.shouldWatchout).length
  );
  console.log(
    '> 8% below max of year',
    cheapBuys.filter(buy => buy.percMax > -8).length
  );
  cheapBuys = cheapBuys.filter(
    buy => !buy.shouldWatchout && buy.percMax < -8
  );

  console.log(cheapBuys, cheapBuys.length);
  return cheapBuys
    .sort((a, b) => b.trend_since_open - a.trend_since_open)
    .slice(0, 5)  // top five trending up
    .map(stock => stock.ticker);
};

const bigDayTrendUp = {
  trendFilter,
  init: Robinhood => {
    // runs at init
    regCronIncAfterSixThirty(Robinhood, {
      name: 'execute big-day-trend-up strategy',
      // run: [10, 30, 90], // 10:41am, 11:31am
      run: [],
      fn: async (Robinhood, min) => {
        await executeStrategy(Robinhood, trendFilter, min, 0.3, 'big-day-trend-up', DISABLED);
      }
    });
  }
};

module.exports = bigDayTrendUp;

const DISABLED = true; // records picks but does not purchase

// utils
const regCronIncAfterSixThirty = require('../utils/reg-cron-after-630');

// app-actions
const executeStrategy = require('../app-actions/execute-strategy');

const mapLimit = require('promise-map-limit');

const getRisk = require('../rh-actions/get-risk');
const trendingUp = require('../rh-actions/trending-up');

const trendFilter = async (Robinhood, trend) => {

  // cheap stocks that have gone up the most since open
  // trending 7, 5, 3
  // not "watching out"

  console.log('running beforeClose strategy');

  const trendingAbove4 = trend.filter(stock => stock.trend_since_open && stock.trend_since_open > 2);
  console.log('trending above 4', trendingAbove4.length);

  let cheapBuys = trendingAbove4.filter(stock => {
    return Number(stock.quote_data.last_trade_price) < 30;
  });
  console.log('trading below $30', cheapBuys.length);

  cheapBuys = await mapLimit(cheapBuys, 20, async buy => ({
    ...buy,
    ...await getRisk(Robinhood, buy.ticker),
    trendingUp: await trendingUp(Robinhood, buy.ticker, [7, 5, 3])
  }));
  // console.log('num watcout', cheapBuys.filter(buy => buy.shouldWatchout).length);
  console.log('num not trending', cheapBuys.filter(buy => !buy.trendingUp).length);
  // console.log('> 5% below max of year', cheapBuys.filter(buy => buy.percMax < -5).length);
  cheapBuys = cheapBuys.filter(buy => buy.trendingUp);

  console.log(cheapBuys, cheapBuys.length);

  return cheapBuys.map(stock => stock.ticker);

};

const beforeCloseUp = {
  trendFilter,
  init: (Robinhood) => {
    // runs at init
    regCronIncAfterSixThirty(
      Robinhood,
      {
        name: 'execute before-close-up strategy',
        // run: [350, 380],  // 12:31, 12:50pm
        run: [],
        fn: async (Robinhood, min) => {
          await executeStrategy(Robinhood, trendFilter, min, 0.35, 'before-close-up', DISABLED);
        }
      },
    );
  }
};


module.exports = beforeCloseUp;

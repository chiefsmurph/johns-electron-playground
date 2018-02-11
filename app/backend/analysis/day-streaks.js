const getTrendAndSave = require('../app-actions/get-trend-and-save');
const login = require('../rh-actions/login');

const mapLimit = require('promise-map-limit');

let Robinhood;

const addOvernightJump = require('../app-actions/add-overnight-jump');
const getUpStreak = require('../app-actions/get-up-streak');
const avgArray = require('../utils/avg-array');

(async () => {

  Robinhood = await login();

  let trend = require('/Users/johnmurphy/Development/my-stuff/robinhood-playground/stock-data/2018-1-23 13:04:23 (+391).json');
  // let trend = await getTrendAndSave(Robinhood);

  trend = addOvernightJump(trend);
  let cheapBuys = trend.filter(stock => {
    return Number(stock.quote_data.last_trade_price) < 10;
  });
  console.log('trading below $30', cheapBuys.length);

  cheapBuys = await mapLimit(cheapBuys, 20, async buy => ({
    ...buy,
    upstreak: await getUpStreak(Robinhood, buy.ticker)
  }));


  const results = {};

  const breakdown = (n, matches) => {

    const jumpedUp = matches.filter(b => b.overnightJump > 1);

    results[n] = {
      count: matches.length,
      percUp: matches.filter(b => Number(b.trend_since_open) > 0).length / matches.length,
      avgToday: avgArray(matches.map(m => Number(m.trend_since_open))),
      jumpedUp: {
        count: jumpedUp.length,
        percUp: jumpedUp.filter(b => Number(b.trend_since_open) > 0).length / jumpedUp.length,
        avgToday: avgArray(jumpedUp.map(m => Number(m.trend_since_open)))
      },
      tickers: matches.map(match => match.ticker)
    };
  };

  [2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(n => {

    const matches = cheapBuys.filter(b => b.upstreak === n);
    breakdown(n, matches);

  });

  breakdown('>10', cheapBuys.filter(b => b.upstreak > 10));

  console.log(JSON.stringify(results, null, 2));

})();

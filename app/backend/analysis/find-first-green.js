const getTrendAndSave = require('../app-actions/get-trend-and-save');
const login = require('../rh-actions/login');
const getTrend = require('../utils/get-trend');
const getMultipleHistoricals = require('../app-actions/get-multiple-historicals');

const mapLimit = require('promise-map-limit');

module.exports = async Robinhood => {

  // let trend = require('/Users/johnmurphy/Development/my-stuff/robinhood-playground/stock-data/2018-2-5 07:24:06 (+50).json');
  let trend = await getTrendAndSave(Robinhood);

  let cheapBuys = trend
    .filter(stock => {
      return Number(stock.quote_data.last_trade_price) < 1 &&
        Number(stock.quote_data.last_trade_price) > .2;
    });

  let allHistoricals = await getMultipleHistoricals(
    Robinhood,
    cheapBuys.map(buy => buy.ticker)
  );

  const withHistoricals = cheapBuys.map((buy, i) => ({
    ...buy,
    historicals: allHistoricals[i]
  }));

  console.log(withHistoricals, 'withhist')

  const ofInterest = withHistoricals
    .filter(({ historicals }) => historicals.length)
    .map(buy => {

      const { historicals } = buy;
      historicals.reverse();

      const mostRecentHistDate = new Date(historicals[0].begins_at);
      mostRecentHistDate.setDate(mostRecentHistDate.getDate() + 1);
      const todaysDate = new Date();
      if (todaysDate.getHours() < 6) {
        todaysDate.setDate(todaysDate.getDate() - 1);
      }
      const todayInHistoricals = mostRecentHistDate.getDate() === todaysDate.getDate();
      console.log(todayInHistoricals, 'today in')
      let mostRecentTrend;
      if (!todayInHistoricals) {
        // daytime
        mostRecentTrend = buy.trend_since_prev_close;
      } else {
        // evening
        mostRecentTrend = historicals.shift().trend;
      }

      return {
        ...buy,
        mostRecentTrend
      };
    })
    .filter(({mostRecentTrend}) => mostRecentTrend > 1)
    .map(buy => {
      let daysDown = [];
      buy.historicals.some(hist => {
        const wentUp = hist.trend < 0;
        daysDown.push(hist);
        return !wentUp;
      });
      delete buy.historicals;
      // delete buy.fundamentals;
      // delete buy.quote_data;
      const daysDownCount = daysDown.length - 1;
      if (daysDownCount) {
        try {
          var percDown = getTrend(daysDown[0].close_price, daysDown[daysDown.length - 1].close_price);
          var points = daysDownCount * Math.abs(percDown) * buy.mostRecentTrend;
        } catch (e) {}
      }
      return {
        ...buy,
        daysDownCount,
        daysDown,
        percDown,
        points
      };
    })
    .filter(buy => buy.daysDownCount > 0 && Math.abs(buy.percDown) > buy.mostRecentTrend)
    .sort((a, b) => b.points - a.points);

  console.log(JSON.stringify(ofInterest, null, 2));
  return ofInterest;

};

const getTrendAndSave = require('../app-actions/get-trend-and-save');
const login = require('../rh-actions/login');
const getTrend = require('../utils/get-trend');

const mapLimit = require('promise-map-limit');

module.exports = async Robinhood => {

  const getHistorical = async ticker => {
    const historicalDailyUrl = `https://api.robinhood.com/quotes/historicals/${ticker}/?interval=day`;
    let { historicals } = await Robinhood.url(historicalDailyUrl);
    return (historicals.length) ? historicals : [];
  };

  // let trend = require('/Users/johnmurphy/Development/my-stuff/robinhood-playground/stock-data/2018-2-5 07:24:06 (+50).json');
  let trend = await getTrendAndSave(Robinhood);

  let cheapBuys = trend
    .filter(stock => {
      return Number(stock.quote_data.last_trade_price) < 1 &&
        Number(stock.quote_data.last_trade_price) > .2;
    });

  let curIndex = 0;
  const withHistoricals = await mapLimit(cheapBuys, 2, async buy => {

    if (curIndex % Math.floor(cheapBuys.length / 10) === 0) {
      console.log('historical', curIndex, 'of', cheapBuys.length);
    }
    curIndex++;

    let historicals = await getHistorical(buy.ticker);
    let prevClose;
    historicals = historicals.map(hist => {
      ['open_price', 'close_price', 'high_price', 'low_price'].forEach(key => {
        hist[key] = Number(hist[key]);
      });
      if (prevClose) {
        hist.trend = getTrend(hist.close_price, prevClose);
      }
      prevClose = hist.close_price;
      return hist;
    });

    return {
      // ticker: buy.ticker,
      ...buy,
      historicals,
    };

  });

  const ofInterest = withHistoricals
    .filter(({ historicals }) => historicals.length)
    .map(buy => {

      const { historicals } = buy;
      historicals.reverse();

      const mostRecentHistDate = new Date(historicals[0].begins_at);
      mostRecentHistDate.setDate(mostRecentHistDate.getDate() + 1);
      const todaysDate = new Date();
      const todayInHistoricals = mostRecentHistDate.getDate() === todaysDate.getDate();

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
    .filter(({mostRecentTrend}) => mostRecentTrend > 3)
    .map(buy => {
      let daysDown = [];
      buy.historicals.some(hist => {
        const wentUp = hist.trend < 0;
        daysDown.push(hist);
        return !wentUp;
      });
      delete buy.historicals;
      delete buy.fundamentals;
      delete buy.quote_data;
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

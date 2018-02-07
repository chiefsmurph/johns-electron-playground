const getTrendAndSave = require('../app-actions/get-trend-and-save');
const login = require('../rh-actions/login');
const getTrend = require('../utils/get-trend');

const mapLimit = require('promise-map-limit');

module.exports = async (Robinhood) => {

  const getHistorical = async ticker => {
    const historicalDailyUrl = `https://api.robinhood.com/quotes/historicals/${ticker}/?interval=day`;
    let { historicals } = await Robinhood.url(historicalDailyUrl);
    return (historicals.length) ? historicals : [];
  };

  // let trend = require('/Users/johnmurphy/Development/my-stuff/robinhood-playground/stock-data/2018-2-5 07:24:06 (+50).json');
  console.log('')
  try {
    var trend = await getTrendAndSave(Robinhood);
  } catch (e) {
    console.log('this', e)
  }
  console.log('trend', trend);

  let cheapBuys = trend
    .filter(stock => {
      return Number(stock.quote_data.last_trade_price) < 5 &&
        Number(stock.quote_data.last_trade_price) > 0.2;
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
    .filter(({historicals}) => historicals.length)
    .map(buy => {

      const {historicals} = buy;
      historicals.reverse();
      // during day
      // const mostRecentTrend = buy.trend_since_open;
      // evening
      const {trend: mostRecentTrend} = historicals.shift();
      return {
        ...buy,
        mostRecentTrend
      };
    })
    .filter(({mostRecentTrend}) => mostRecentTrend < -3)
    .map(buy => {
      let daysUp = [];
      buy.historicals.some(hist => {
        const wentUp = hist.trend > 0;
        daysUp.push(hist);
        return !wentUp;
      });
      delete buy.historicals;
      delete buy.fundamentals;
      delete buy.quote_data;
      const daysUpCount = daysUp.length - 1;
      if (daysUpCount) {
        try {
          var percUp = getTrend(daysUp[0].close_price, daysUp[daysUp.length - 1].close_price);
          var points = daysUpCount * percUp * Math.abs(buy.mostRecentTrend);
        } catch (e) {}
      }
      return {
        ...buy,
        daysUpCount,
        daysUp,
        percUp,
        points
      };
    })
    .filter(buy => buy.daysUpCount > 0 && buy.percUp > Math.abs(buy.mostRecentTrend))
    .sort((a, b) => b.points - a.points);

  console.log(JSON.stringify(ofInterest, null, 2));
  return ofInterest;

};

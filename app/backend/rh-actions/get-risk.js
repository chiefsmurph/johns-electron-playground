// watchout if stock has flutuated more than 15% in 24 hours in the last 3 months

const getTrend = require('../utils/get-trend');
const avgArray = require('../utils/avg-array');

const shouldWatchout = async (Robinhood, ticker) => {
  console.log('evaluating risk ...', ticker);
  const historicalDailyUrl = `https://api.robinhood.com/quotes/historicals/${ticker}/?interval=day`;
  let { historicals: dailyYear} = await Robinhood.url(historicalDailyUrl);

  if (!dailyYear.length) {
  return { shouldWatchout: true };
  }

  let maxClose = 0;
  const overnightJumps = [];
  dailyYear = dailyYear
  .map((historical, ind) => {
    const prevDay = dailyYear[ind - 1] || {};
    const trend = getTrend(historical.close_price, prevDay.close_price);
    if (trend < -3) {
    const jumpOvernight = Number(prevDay.close_price) - Number(historical.open_price);
    jumpOvernight && overnightJumps.push(jumpOvernight);
    }
    if (Number(historical.close_price) > maxClose) maxClose = Number(historical.close_price);
    return {
    ...historical,
    trend
    };
  });

  const shouldWatchout = (
  dailyYear.slice(-90).some(historical => historical.trend > 25) ||
  dailyYear.some(historical => historical.trend < -15)
  );

  return {
  shouldWatchout,
  avgJumpAfterDrop: +(avgArray(overnightJumps).toFixed(2)),
  percMax: getTrend(dailyYear[dailyYear.length - 1].close_price, maxClose)
  };
  // console.log(JSON.stringify(dailyYear, null, 2));
};

module.exports = shouldWatchout;

// utils
const getTrend = require('../utils/get-trend');


module.exports = (trend) => {

  return trend.map(stock => ({
    ...stock,
    overnightJump: getTrend(stock.fundamentals.open, stock.quote_data.previous_close)
  })).filter(a => a.open).sort((a, b) => b.overnightJump - a.overnightJump);

};

module.exports = async (Robinhood, trend) => {

  return trend
  .filter(stock => {
    return Number(stock.last_trade_price) < 3// && stock.fundamentals.trend_since_open && stock.fundamentals.pe_ratio;
  })
  // .map(stock => ({
  //   ticker: stock.ticker,
  //   last_trade_price: stock.last_trade_price
  // }))
  // .sort((a, b) => Number(b.fundamentals.pe_ratio) - Number(a.fundamentals.pe_ratio))
  // .slice(0, 100)
  .sort((a, b) => Number(a.last_trade_price) - Number(b.last_trade_price))

};

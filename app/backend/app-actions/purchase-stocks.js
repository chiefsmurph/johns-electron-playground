const limitBuyMultiple = require('./limit-buy-multiple');

const purchaseStocks = async (Robinhood, { stocksToBuy, ratioToSpend, strategy }) => {
  const accounts = await Robinhood.accounts();
  const totalAmtToSpend = Number(accounts.results[0].sma) * ratioToSpend;
  console.log('totalAmtToSpend', totalAmtToSpend);
  await limitBuyMultiple(Robinhood, {
    stocksToBuy,
    totalAmtToSpend,
    strategy
  });
};

module.exports = purchaseStocks;

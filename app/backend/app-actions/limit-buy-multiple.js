const activeBuy = require('./active-buy');

module.exports = async (Robinhood, {stocksToBuy, totalAmtToSpend, strategy, maxNumStocksToPurchase }) => {

  // you cant attempt to purchase more stocks than you passed in
  console.log(maxNumStocksToPurchase, 'numstockstopurchase', stocksToBuy.length);
  maxNumStocksToPurchase = maxNumStocksToPurchase ? Math.min(stocksToBuy.length, maxNumStocksToPurchase) : stocksToBuy.length;

  let numPurchased = 0;

  // randomize the order
  stocksToBuy = stocksToBuy.sort(() => Math.random() > Math.random());
  let amtToSpendLeft = totalAmtToSpend;
  let failedStocks = [];
  for (let stock of stocksToBuy) {
  const perStock = amtToSpendLeft / (maxNumStocksToPurchase - numPurchased);
  const response = await activeBuy(Robinhood, {
    ticker: stock,
    maxPrice: perStock,
    strategy
  });
  console.log('response for limitorder');
  console.log(response);

  if (!response || response.detail) {
    // failed
    failedStocks.push(stock);
    console.log('failed purchase for ', stock);
  } else {
    console.log('success,', stock);
    amtToSpendLeft -= perStock;
    numPurchased++;
    if (numPurchased === maxNumStocksToPurchase) {
    break;
    }
  }
  }

  console.log('finished purchasing', stocksToBuy.length, 'stocks');
  console.log('attempted amount', totalAmtToSpend);
  console.log('amount leftover', amtToSpendLeft);
  failedStocks.length && console.log('failed stocks', JSON.stringify(failedStocks));
};

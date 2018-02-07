const detailedNonZero = require('./detailed-non-zero');
const activeSell = require('./active-sell');

const MIN_PERC_UP = 14; // sell if stock rose 18% since yesterdays close

module.exports = async Robinhood => {
  const nonzero = await detailedNonZero(Robinhood);
  const goneUp = nonzero.filter(pos => pos && pos.currentPrice > pos.prevClose * (100+MIN_PERC_UP) / 100);
  console.log(nonzero.length, 'total', goneUp.length, 'gone up');
  for (let pos of goneUp) {
  const response = await activeSell(
    Robinhood,
    {
    ticker: pos.symbol,
    quantity: pos.quantity
    }
  );
  console.log('sold because gone up', response);
  }

};

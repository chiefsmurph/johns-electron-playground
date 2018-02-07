const mapLimit = require('promise-map-limit');
const lookup = require('../utils/lookup');

module.exports = async (Robinhood) => {
  const { results: allPositions } = await Robinhood.nonzero_positions();
  console.log('getting detailed non zero');
  const withTicks = await mapLimit(allPositions, 1, async pos => {
  const instrument = await Robinhood.url(pos.instrument);
  const lookupObj = await lookup(instrument.symbol, Robinhood);
  return {
    average_buy_price: Number(pos.average_buy_price),
    symbol: instrument.symbol,
    quantity: pos.quantity,
    ...lookupObj
  };
  });
  console.log('made it', withTicks);
  return withTicks;
};

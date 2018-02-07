// starts attempting to buy at 100% of current stock price
// every attempt it goes up from there until it successfully gets sold or it reaches MAX_BUY_RATIO

const limitBuyLastTrade = require('../rh-actions/limit-buy-last-trade');
const jsonMgr = require('../utils/json-mgr');

const lookup = require('../utils/lookup');
const mapLimit = require('promise-map-limit');


const MAX_BUY_RATIO = 1.02; // before gives up
const TIME_BETWEEN_CHECK = 45; // seconds
const BUY_RATIO_INCREMENT = 0.003;


const addToDailyTransactions = async data => {
  const fileName = `./daily-transactions/${(new Date()).toLocaleDateString()}.json`;
  const curTransactions = await jsonMgr.get(fileName) || [];
  curTransactions.push(data);
  await jsonMgr.save(fileName, curTransactions);
};


module.exports = async (Robinhood, { ticker, strategy, maxPrice }) => {

  let curBuyRatio = 1.0;
  let attemptCount = 0;
  maxPrice = Math.min(maxPrice, 70);

  const attempt = async () => {

    attemptCount++;
    console.log('attempting ', curBuyRatio, ticker, 'ratio', curBuyRatio);
    const { currentPrice } = (await lookup(ticker, Robinhood));
    const bidPrice = currentPrice * curBuyRatio;
    const quantity = Math.floor(maxPrice / bidPrice);
    if (!quantity) {
      console.log('maxPrice below bidPrice', maxPrice, bidPrice, ticker);
      return;
    }

    await limitBuyLastTrade(
      Robinhood,
      {
      ticker,
      bidPrice,
      quantity,
      strategy
      }
    );

    setTimeout(async () => {

      // get orders, check if still pending
      let {results: orders} = await Robinhood.orders();
      orders = orders.filter(order => ['filled', 'cancelled'].indexOf(order.state) === -1);

      orders = await mapLimit(orders, 1, async order => ({
      ...order,
      instrument: await Robinhood.url(order.instrument)
      }));

      const relOrder = orders.find(order => {
      return order.instrument.symbol === ticker;
      });
      // console.log(relOrder);
      if (relOrder) {
      console.log('canceling last attempt', ticker);
      await Robinhood.cancel_order(relOrder);
      curBuyRatio += BUY_RATIO_INCREMENT;
      if (curBuyRatio < MAX_BUY_RATIO) {
        return attempt();
      } else {
        console.log('reached MAX_BUY_RATIO, unable to BUY', ticker);
      }
      } else {

      // update daily transactions

      await addToDailyTransactions({
        type: 'buy',
        ticker,
        bid_price: bidPrice,
        quantity,
        strategy
      });

      if (attemptCount) {
        console.log('successfully bought with attemptcount', attemptCount, ticker);
      }

    }
  }, TIME_BETWEEN_CHECK * 1000);

  };

  attempt();


};

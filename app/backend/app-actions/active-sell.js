// starts attempting to sell at 100% of current stock price
// every attempt it goes down from there until it successfully gets sold or it reaches MIN_SELL_RATIO

// const keepers = require('../keepers');

const limitSellLastTrade = require('../rh-actions/limit-sell-last-trade');
const jsonMgr = require('../utils/json-mgr');

const { lookup } = require('yahoo-stocks');
const mapLimit = require('promise-map-limit');


const MIN_SELL_RATIO = 0.97; // before gives up
const TIME_BETWEEN_CHECK = 30; // seconds
const SELL_RATIO_INCREMENT = 0.005;


const addToDailyTransactions = async data => {
  const fileName = `./daily-transactions/${(new Date()).toLocaleDateString()}.json`;
  const curTransactions = await jsonMgr.get(fileName) || [];
  curTransactions.push(data);
  await jsonMgr.save(fileName, curTransactions);
};


module.exports = async (Robinhood, { ticker, quantity }) => {

  // if (keepers.includes(ticker)) {
  //   console.log('ticker on keeper list', ticker);
  //   return;
  // }

  let curSellRatio = 1.0;
  let attemptCount = 0;

  const attempt = async () => {

    attemptCount++;
    console.log('attempting ', curSellRatio, ticker);
    const curPrice = (await lookup(ticker)).currentPrice;
    const bidPrice = curPrice * curSellRatio;
    const res = await limitSellLastTrade(
      Robinhood,
      {
        ticker,
        quantity,
        bidPrice
      }
    );

    if (!res || res.detail)  {
      // dont log transaction if failed
      console.log('failed purchasing', ticker);
      return;
    }

    setTimeout(async () => {

      // get orders, check if still pending
      let {results: orders} = await Robinhood.orders();
      orders = orders.filter(order => !['filled', 'cancelled'].includes(order.state));

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
        curSellRatio -= SELL_RATIO_INCREMENT;
        if (curSellRatio > MIN_SELL_RATIO) {
          return attempt();
        } else {
          console.log('reached MIN_SELL_RATIO, unable to sell', ticker);
        }
      } else {

        // await addToDailyTransactions({
        //   type: 'sell',
        //   ticker,
        //   bid_price: bidPrice,
        //   quantity
        // });

        if (attemptCount) {
          console.log('successfully sold with attemptcount', attemptCount, ticker);
        }

      }
    }, TIME_BETWEEN_CHECK * 1000);

  };

  attempt();


};


// app actions
const getTrendAndSave = require('../app-actions/get-trend-and-save');
const logPortfolioValue = require('../app-actions/log-portfolio-value');

// utils
const regCronIncAfterSixThirty = require('../utils/reg-cron-after-630');
const timeoutPromise = require('../utils/timeout-promise');

// rh actions
const sellAllIfWentUp = require('../app-actions/sell-all-if-went-up');
const sellAllStocks = require('../app-actions/sell-all-stocks');

const additionalCronConfig = [
  {
    name: 'sell all stocks if went up',
    run: [0],
    fn: (Robinhood) => {

      setTimeout(async () => {
        // daily at 6:30AM + 4 seconds
        console.log('selling all stocks that went up');
        await sellAllIfWentUp(Robinhood);
        console.log('done selling all');
        //
        timeoutPromise(20000);
        await sellAllIfWentUp(Robinhood);
        // console.log('logging portfolio value');
        // await logPortfolioValue(Robinhood);

      }, 4000);

    }
  },
  // sell all if went up
  {
    name: 'sellAllIfWentUp',
    run: [145, 305],
    fn: sellAllIfWentUp
  },
  // sell all if went up
  // {
  //   name: 'sellAllStocks',
  //   run: [330],   // 12pm
  //   fn: sellAllStocks
  // },
  // log port value
  // {
  //   name: 'log the portfolio value',
  //   run: [195, 292, 390],
  //   fn: logPortfolioValue
  // },
  // log the trend
  // {
  //   name: 'log the trend',
  //   run: [75, 105, 180],
  //   fn: getTrendAndSave
  // }
];

const additionalCron = {
  init: (Robinhood) => {
    additionalCronConfig.forEach(cronConfig => {
      regCronIncAfterSixThirty(
        Robinhood,
        cronConfig
      );
    });
  }
};

module.exports = additionalCron;

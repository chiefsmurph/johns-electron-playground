const mapLimit = require('promise-map-limit');

// utils
const regCronIncAfterSixThirty = require('../utils/reg-cron-after-630');

// app-actions
const purchaseStocks = require('../app-actions/purchase-stocks');

// rh-actions
const trendingUp = require('../rh-actions/trending-up');

// utils
const timeoutPromise = require('../utils/timeout-promise');

const currentRecommendations = {
  "top": [
  "IGT",
  "BAC",
  "NEOS",
  "CATB",
  "DRYS",
  "LINU",
  "OSUR",
  "INSY",
  "TM",
  "BABA",
  "NSPR",
  "NRG",
  "IAC",
  "GWPH",
  "NFLX",
  "ACH",
  "AA",
  "DE"
  ],
  "somewhat": [
  "OPNT",
  "ORCL",
  "NMM",
  "ERF",
  "CPG",
  "SID",
  "TSN",
  "^GSPC",
  "GM",
  "XPO",
  "SIRI"
  ]
};

const beforeClose = {
  init: Robinhood => {
    // runs at init
    regCronIncAfterSixThirty(Robinhood, {
      name: 'execute pattern predict strategy',
      run: [], // 12:31, 12:50pm
      fn: async (Robinhood) => {

        await purchaseStocks(Robinhood, {
          stocksToBuy: currentRecommendations.top.slice(0, 5),
          ratioToSpend: 0.20,
          strategy: 'pattern-predict-top-five'
        });

        await timeoutPromise(5000);

        for (let key of Object.keys(currentRecommendations)) {

          const strategyName = `pattern-predict-${key}`;
          console.log('running', strategyName);

          // orig list
          const stockArr = currentRecommendations[key];
          await purchaseStocks(Robinhood, {
            stocksToBuy: stockArr,
            ratioToSpend: 0.2,
            strategy: strategyName
          });

          await timeoutPromise(3000);

          // robinhood tainted
          let stocksTrending = await mapLimit(stockArr, 5, async ticker => ({
            ticker,
            trendingUp: await trendingUp(Robinhood, ticker, [7])
          }));
          console.log(stocksTrending);
          stocksTrending = stockArr
            .filter(obj => obj.trendingUp)
            .map(obj => obj.ticker);

          await purchaseStocks(Robinhood, {
            stocksToBuy: stocksTrending,
            ratioToSpend: 0.2,
            strategy: `${strategyName}-trending`
          });

          await timeoutPromise(3000);
        }

      }
    });
  }
};

module.exports = beforeClose;

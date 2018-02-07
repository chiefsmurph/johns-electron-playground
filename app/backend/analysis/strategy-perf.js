const fs = require('mz/fs');
const mapLimit = require('promise-map-limit');
const getTrend = require('../utils/get-trend');
const avgArray = require('../utils/avg-array');

let sortedFiles, allTransObj;

const calcStratPerf = date => {

  const transactions = allTransObj[date];

  const sells = transactions.filter(t => t.type === 'sell');
  // console.log(date, sells);

  const dayInd = sortedFiles.findIndex(f => f === date);
  // console.log(dayInd);
  const prevDay = sortedFiles[dayInd - 1];
  if (!prevDay) return;
  const prevDayTransactions = allTransObj[prevDay];

  const stratPerf = {};
  sells.forEach(sell => {

  const buys = prevDayTransactions.filter(buy => {
    return buy.type === 'buy' && buy.ticker === sell.ticker && buy.strategy;
  });

  if (sell.ticker === 'RLGT') {
    console.log('rlgt', buys);
  }

  buys.forEach(buy => {
    const foundStrategy = buy.strategy;
    const trend = getTrend(sell.bid_price, buy.bid_price);
    const obj = {
    buyPrice: buy.bid_price,
    sellPrice: sell.bid_price,
    trend,
    ticker: buy.ticker
    };
    stratPerf[foundStrategy] = (stratPerf[foundStrategy] || []).concat(obj);
  });

  // console.log(t.ticker, 'found matches', prevMatches);

  });

  console.log(date, '.....')
  Object.keys(stratPerf).forEach(strategy => {
  stratPerf[strategy] = {
    avgTrend: avgArray(stratPerf[strategy].map(t => t.trend)),
    // transactions: stratPerf[strategy]
  };
  console.log(strategy, stratPerf[strategy]);
  });
  console.log('-----------------');

  };

  (async () => {

  let files = await fs.readdir('./daily-transactions');
  files = files.map(file => file.split('.')[0]);

  sortedFiles = files.sort((a, b) => {
  return new Date(a) - new Date(b);
  });

  console.log(sortedFiles);
  const allTransactions = await mapLimit(sortedFiles, 1, async file => {
  return JSON.parse(await fs.readFile('./daily-transactions/' + file + '.json', 'utf8'));
  });

  allTransObj = allTransactions.reduce((acc, val, ind) => {
  acc[sortedFiles[ind]] = val;
  return acc;
  }, {});

  // console.log(JSON.stringify(allTransObj, null, 2));

  // calcStratPerf('2018-1-18');
  sortedFiles.forEach(calcStratPerf);

})();

const getTrendAndSave = require('../app-actions/get-trend-and-save');
const login = require('../rh-actions/login');

const mapLimit = require('promise-map-limit');

let Robinhood;

const addOvernightJump = require('../app-actions/add-overnight-jump');
const getUpStreak = require('../app-actions/get-up-streak');
const avgArray = require('../utils/avg-array');
const getTrend = require('../utils/get-trend');

const getHistorical = async ticker => {
  const historicalDailyUrl = `https://api.robinhood.com/quotes/historicals/${ticker}/?interval=day`;
  let { historicals } = await Robinhood.url(historicalDailyUrl);
  return (historicals.length) ? historicals : [];
};


(async () => {

  Robinhood = await login();

  let trend = require('/Users/johnmurphy/Development/my-stuff/robinhood-playground/stock-data/2018-1-23 13:04:23 (+391).json');
  // let trend = await getTrendAndSave(Robinhood);

  trend = addOvernightJump(trend);


  let cheapBuys = trend
  // .filter(stock => {
  //   return Number(stock.quote_data.last_trade_price) > 5 && Number(stock.quote_data.last_trade_price) < 6;
  // });

  // var allTickers = require('../stock-data/allStocks');
  // allTickers = allTickers
  //   .filter(stock => stock.tradeable)
  //   .map(stock => stock.symbol);


  console.log('getting historicals')

  let curIndex = 0;
  cheapBuys = await mapLimit(cheapBuys, 20, async buy => {

    if (curIndex % Math.floor(cheapBuys.length / 10) === 0) {
      console.log('historical', curIndex, 'of', cheapBuys.length);
    }
    curIndex++;


    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    let prehistoricals = await getHistorical(buy.ticker) || [];

    let index = 0;
    let historicals = await mapLimit(prehistoricals, 1, async hist => {


      // console.log('about to get upstreak', hist);
      const upstreak = await getUpStreak(
        Robinhood,
        buy.ticker,
        prehistoricals.slice(0, index)
      );
      // console.log(index, prehistoricals.slice(0, index));
      // console.log(upstreak);


      index++;
      return {
        ...hist,
        ticker: buy.ticker,
        dow: days[ (new Date(hist.begins_at)).getDay() + 1 ],
        trend: getTrend(hist.close_price, hist.open_price),
        upstreak
      };

    });

    return {
      ...buy,
      historicals,
      dowAgg: days.map(day => {
        const matches = historicals.filter(hist =>
          hist.dow === day &&
          hist.upstreak > 1
        );
        return {
          ticker: buy.ticker,
          day,
          count: matches.length,
          percUp: matches.filter(b => Number(b.trend) > 0).length / matches.length,
          avgToday: avgArray(matches.map(m => Number(m.trend))),
          // trends: matches.map(m => Number(m.trend))
          // matches
        };
      })
    };

  });


  // sort by stock percUp

  let onlyAggs = [].concat.apply(
    [],
    cheapBuys.map(buy => buy.dowAgg)
  )
    .filter(agg => agg.percUp && agg.avgToday && agg.count > 5)
    .filter(agg => agg.day === 'Friday');



  let sortedByPercUp = onlyAggs
    .sort((a, b) => b.percUp - a.percUp)
    .slice(0, 20);


  const addWentUp = aggregate => {
    return aggregate.map(agg => {
      const relBuy = cheapBuys.find(buy => agg.ticker === buy.ticker);
      if (!relBuy.historicals) { return agg; }
      const todayHist = relBuy.historicals[relBuy.historicals.length - 1];
      return {
        ...agg,
        todayHist,
        todayUpstreak: todayHist.upstreak,
        wentUp: Number(todayHist.close_price) > Number(todayHist.open_price)
      };
    });
  };

  sortedByPercUp = addWentUp(sortedByPercUp);


  let sortedByAvgToday = onlyAggs
    .sort((a, b) => b.avgToday - a.avgToday)
    .slice(0, 20);

  sortedByAvgToday = addWentUp(sortedByAvgToday);

  console.log('\nsortedByPercUp');
  console.log(JSON.stringify(sortedByPercUp, null, 2));

  console.log('\nsortedByAvgToday');
  console.log(JSON.stringify(sortedByAvgToday, null, 2));


  const breakdown = aggregate => {
    const activeUp = aggregate.filter(agg => agg.todayUpstreak > 1);
    const wentUp = activeUp.filter(agg => agg.wentUp);
    console.log('activeUp', activeUp.length);
    console.log('wentUp', wentUp.length);
    console.log((wentUp / activeUp));
  };

  breakdown(sortedByPercUp);
  breakdown(sortedByAvgToday);


})();

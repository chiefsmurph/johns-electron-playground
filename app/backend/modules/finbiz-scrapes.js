const puppeteer = require('electron').remote.require('puppeteer');
const regCronIncAfterSixThirty = require('../utils/reg-cron-after-630');
const registerPicks = require('../app-actions/record-picks');

const RUN = [0, 1, 10, 60, 120, 180, 380, 874];
const QUERIES = {
  under5Target10Change2Vol200: 'https://finviz.com/screener.ashx?v=111&f=cap_smallover%2Csh_curvol_o200%2Csh_price_u5%2Cta_change_u2%2Cta_changeopen_u2%2Ctargetprice_a10&ft=4&o=-change',
  under5TopLosers: 'https://finviz.com/screener.ashx?v=111&s=ta_toplosers&f=sh_price_u5'
};

const scrapeFizbiz = async (url) => {
  const browser = await puppeteer.launch({headless: false });
  const page = await browser.newPage();
  await page.goto(url);
  const results = await page.evaluate(() => {
    const trs = Array.from(
      document.querySelectorAll('#screener-content tr:nth-child(4) table tr')
    ).slice(1);
    const tickerAndPrice = trs.map(tr => {
      const getTD = num => tr.querySelector(`td:nth-child(${num})`).textContent;
      return {
        ticker: getTD(2),
        price: Number(getTD(9)),
        trend: getTD(10)
      };
    });
    return tickerAndPrice;
  });
  console.log('got em ')
  await browser.close();
  console.log('returning')
  return results;
}

// based on jump
const finbizScrapes = {
  init: (Robinhood) => {
    // runs at init
    regCronIncAfterSixThirty(Robinhood, {
      name: 'record fizbiz-scrapes',
      // run: [15], // 7:00am
      run: RUN,
      fn: async (Robinhood, min) => {

        console.log('running fizbiz')
        const queries = Object.keys(QUERIES);
        for (let queryName of queries) {
          console.log(queryName);
          const queryPicks = await scrapeFizbiz(QUERIES[queryName]);
          console.log(queryName, queryPicks);
          await registerPicks(`fizbiz-${queryName}`, min, queryPicks);
        }

      }
    });
  }
};

module.exports = finbizScrapes;

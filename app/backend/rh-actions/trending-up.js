const getRelatedHistorical = (historicals, daysBack) => {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);

  let foundHistorical;
  historicals.some(data => {
  if (new Date(data.begins_at) > d) {
    foundHistorical = data;
    return true;
  }
  });
  return foundHistorical;
};


const trendingUp = async (Robinhood, ticker, days) => {
  try {

  const quoteData = await Robinhood.quote_data(ticker);
  let { previous_close: prevClose } = quoteData.results[0];

  const mustMatch = Array.isArray(days) ? days : [days];

  console.log('trending up ? ...', ticker, mustMatch);
  const historicalDailyUrl = `https://api.robinhood.com/quotes/historicals/${ticker}/?interval=day`;
  let { historicals } = await Robinhood.url(historicalDailyUrl);

  // console.log(historicals, historicals.length);
  if (!historicals.length) {
    return null;
  }
  console.log(prevClose, historicals);
  historicals = historicals.filter(hist => hist.close_price);
  return mustMatch.every((period, ind) => {
    const relatedHistorical = getRelatedHistorical(historicals, period);
    console.log(relatedHistorical);
    if (!relatedHistorical) return true;
    const trendingUpPeriod = Number(relatedHistorical.close_price) < Number(prevClose);
    return trendingUpPeriod;
  });

  } catch (e) {
  console.log(e);
  return null;
  }

};

module.exports = trendingUp;

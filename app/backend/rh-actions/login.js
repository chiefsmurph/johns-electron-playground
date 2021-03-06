const { credentials } = require('../config');
// const retryPromise = require('../utils/retry-promise');

module.exports = () => {
  return new Promise((resolve) => {
    const Robinhood = require('robinhood')(credentials, () => {

      // promisfy all functions
      Object.keys(Robinhood).forEach(key => {
        console.log('key', key);
        const origFn = Robinhood[key];
        Robinhood[key] = (...callArgs) => {
          return new Promise((fnResolve, fnReject) => {
            origFn.apply(null, [...callArgs, (error, response, body) => {
              return (error || !body) ? fnReject(error) : fnResolve(body);
            }]);
          });
        };
      });

      resolve(Robinhood);
    });
  });
};

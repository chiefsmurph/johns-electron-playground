const storage = require('electron-json-storage');

module.exports = (() => {
  const newS = { ...storage };
  Object.keys(newS).forEach(key => {
    console.log('key', key);
    const origFn = newS[key];
    newS[key] = (...callArgs) => {
      return new Promise((resolve, reject) => {
        origFn.apply(null, [...callArgs, (error, body) => {
          console.log(error, body);
          return (error) ? reject(error) : resolve(body);
        }]);
      });
    };
  });
  return newS;
})();

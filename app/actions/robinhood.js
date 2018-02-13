import rhLogin from '../backend/rh-actions/login';
import getDetailedNonZero from '../backend/app-actions/detailed-non-zero';
import initModules from '../backend/app-actions/init-modules';

const regCronIncAfterSixThirty = require('../backend/utils/reg-cron-after-630');

const { app } = require('electron').remote;
const fs = require('mz/fs');

const twoDecs = num => +(num).toFixed(2);


export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const SET_CURRENT_POSITIONS = 'SET_CURRENT_POSITIONS';
export const SET_GETTING_POSITIONS = 'SET_GETTING_POSITIONS';

export function login(credentials) {
  return {
    type: LOGIN,
    credentials
  };
}

export function loginSucess(instance) {
  return {
    type: LOGIN_SUCCESS,
    instance
  };
}

export function loginFail(error) {
  return {
    type: LOGIN_FAIL,
    error
  };
}

export function loginRh() {
  return (dispatch) => {

    return new Promise(async (resolve) => {
      console.log('ROBINHOOD')
      const Robinhood = await rhLogin();
      dispatch(loginSucess(Robinhood));
      dispatch(initBackground(Robinhood));
      dispatch(getCurrentPositions(Robinhood));
      let { results: orders } = await Robinhood.orders();
      orders = orders.filter(order => !['filled', 'cancelled'].includes(order.state));
      console.log(orders, 'ORDERS')
      resolve();

    });

  }
};

export function setGettingPositions(gettingPositions) {
  return {
    type: SET_GETTING_POSITIONS,
    gettingPositions
  };
}

export function getCurrentPositions(Robinhood) {
  return async (dispatch, getState) => {
    dispatch(setGettingPositions(true));
    let rh = Robinhood || getState().robinhood.instance;
    let nonZero = await getDetailedNonZero(rh);
    nonZero = nonZero
      .map(position => ({
        ...position,
        overallValue: twoDecs(position.quantity * position.currentPrice)
      }))
      .sort((a, b) => b.overallValue - a.overallValue);
    console.log(nonZero);
    dispatch(setCurrentPositions(nonZero));
    dispatch(setGettingPositions(false));
  }
}

export function setCurrentPositions(positions) {
  return {
    type: SET_CURRENT_POSITIONS,
    positions,
    lastFetched: (new Date()).toLocaleString()
  };
}

export function initBackground(Robinhood) {
  return async (dispatch) => {
    // const remote = require('electron').remote;
    // const appPath = process.env.NODE_ENV === 'production' ? remote.app.getAppPath() : __dirname
    // console.log('appPath', appPath, 'prod', process.env.NODE_ENV === 'production');
    // await fs.writeFile(appPath + '/turkey.txt', 'cripsy');
    await initModules(Robinhood);
    regCronIncAfterSixThirty.display();
  };
}

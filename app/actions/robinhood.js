import rhLogin from '../backend/rh-actions/login';
import getDetailedNonZero from '../backend/app-actions/detailed-non-zero';

const twoDecs = num => +(num).toFixed(2);


export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const SET_CURRENT_POSITIONS = 'SET_CURRENT_POSITIONS';

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
      dispatch(getCurrentPositions(Robinhood));
      resolve();

    });

  }
};

export function getCurrentPositions(Robinhood) {
  return async (dispatch, getState) => {
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
  }
}

export function setCurrentPositions(positions) {
  return {
    type: SET_CURRENT_POSITIONS,
    positions,
    lastFetched: (new Date()).toLocaleString()
  };
}
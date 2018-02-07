import rhLogin from '../backend/rh-actions/login';
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';


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
      resolve();

    });

  }
};

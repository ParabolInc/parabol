const GET_USER_INFO = 'action/auth/GET_USER_INFO';
const GET_USER_INFO_SUCCESS = 'action/auth/GET_USER_INFO_SUCCESS';
const GET_USER_INFO_FAIL = 'action/auth/GET_USER_INFO_FAIL';
const LOAD_TOKEN = 'action/auth/LOAD_TOKEN';
const LOAD_TOKEN_SUCCESS = 'action/auth/LOAD_TOKEN_SUCCESS';
const LOAD_TOKEN_FAIL = 'action/auth/LOAD_TOKEN_FAIL';
const SET_SIGNIN_ACTION = 'action/auth/SET_SIGNIN_ACTION';
const SET_TOKEN = 'action/auth/SET_TOKEN';
const SET_TOKEN_SUCCESS = 'action/auth/SET_TOKEN_SUCCESS';
const SET_TOKEN_FAIL = 'action/auth/SET_TOKEN_FAIL';

const initialState = {
  signinAction: null,
  token: {
    loaded: false,
    loading: false,
    error: '',
    value: null
  },
  userInfo: {
    loaded: false,
    loading: false,
    error: '',
    value: null
  }
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case GET_USER_INFO:
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          loading: true
        }
      };
    case GET_USER_INFO_SUCCESS:
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          loading: false,
          loaded: true,
          value: action.result
        }
      };
    case GET_USER_INFO_FAIL:
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          loading: false,
          loaded: false,
          error: action.error,
          value: null
        }
      };
    case LOAD_TOKEN:
    case SET_TOKEN:
      return {
        ...state,
        token: {
          ...state.token,
          loading: true
        }
      };
    case LOAD_TOKEN_SUCCESS:
    case SET_TOKEN_SUCCESS:
      return {
        ...state,
        token: {
          ...state.token,
          loading: false,
          loaded: true,
          value: action.result
        }
      };
    case LOAD_TOKEN_FAIL:
    case SET_TOKEN_FAIL:
      return {
        ...state,
        token: {
          ...state.token,
          loading: false,
          loaded: false,
          error: action.error,
          value: null
        }
      };
    case SET_SIGNIN_ACTION:
      return {
        ...state,
        signinAction: action.payload
      };
    default:
      return state;
  }
}


export function getUserInfo(token) {
  return {
    types: [GET_USER_INFO, GET_USER_INFO_SUCCESS, GET_USER_INFO_FAIL],
    promise: (client) => client.falcor
      .call('users.updateCacheWithToken',
        [ token ], // params
        [], // no refs
      )
      .then( (response) => {
        return response.json['users.updateCacheWithToken'];
      })
      .then( (auth0UserId) => {
        return client.falcor
        .get([['usersById'], [ auth0UserId ],
          ['createdAt', 'updatedAt', 'userId', 'email',
           'emailVerified', 'picture', 'name', 'nickname',
           'identities', 'loginsCount', 'blockedFor']])
        .then( (response) => {
          return response.json.usersById[auth0UserId];
        });
      })
  };
}

export function isTokenLoaded(globalState) {
  return (globalState.auth && globalState.auth.token &&
           globalState.auth.token.loaded);
}

export function loadToken() {
  return {
    types: [LOAD_TOKEN, LOAD_TOKEN_SUCCESS, LOAD_TOKEN_FAIL],
    promise: (client) => {
      return new Promise( (resolve, reject) => {
        if (client.token !== null) {
          resolve(client.token);
        } else {
          reject('unable to load auth token');
        }
      });
    }
  };
}

export function setToken(token) {
  return {
    types: [SET_TOKEN, SET_TOKEN_SUCCESS, SET_TOKEN_FAIL],
    promise: (client) => {
      return new Promise( (resolve, reject) => {
        client.updateToken(token);
        if (token) {
          resolve(token);
        } else {
          reject('unable to set auth token');
        }
      });
    }
  };
}

export function setTokenError(error) {
  return {
    type: SET_TOKEN_FAIL,
    payload: {
      error: error
    }
  };
}

export function setSigninAction(url) {
  return {
    type: SET_SIGNIN_ACTION,
    payload: url
  };
}

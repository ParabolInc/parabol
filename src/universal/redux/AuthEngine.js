import {setAuthToken, removeAuthToken} from './authDuck';

export default class ReduxAuthEngine {
  constructor(store) {
    this.store = store;
  }
  saveToken(name, token, options, callback) {
    this.store.dispatch(setAuthToken(token));
    if (callback) callback(null, token);
  }

  removeToken(name, callback) {
    const token = this.store.getState().authToken;
    this.store.dispatch(removeAuthToken());
    if (callback) callback(null, token);
  }

  loadToken(name, callback) {
    const token = this.store.getState().authToken;
    if (callback) callback(null, token);
  }
}


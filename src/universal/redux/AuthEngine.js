import {setAuthToken, removeAuthToken} from './authDuck';

export default class AuthEngine {
  constructor(store, reducerName = 'auth') {
    this.store = store;
    this.reducerName = reducerName;
  }
  saveToken(name, token, options, callback) {
    this.store.dispatch(setAuthToken(token));
    if (callback) callback(null, token);
  }

  removeToken(name, callback) {
    const token = this.store.getState()[this.reducerName].token;
    this.store.dispatch(removeAuthToken());
    if (callback) callback(null, token);
  }

  loadToken(name, callback) {
    const token = this.store.getState()[this.reducerName].token;
    if (callback) callback(null, token);
  }
}

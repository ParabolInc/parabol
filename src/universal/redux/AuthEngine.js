import {setAuthToken, removeAuthToken} from './authDuck';

export default class AuthEngine {
  constructor(store, reducerName = 'authToken') {
    this.store = store;
    this.reducerName = reducerName;
  }
  saveToken(name, token, options, callback) {
    this.store.dispatch(setAuthToken(token));
    if (callback) callback(null, token);
  }

  removeToken(name, callback) {
    const token = this.store.getState()[this.reducerName];
    this.store.dispatch(removeAuthToken());
    if (callback) callback(null, token);
  }

  loadToken(name, callback) {
    const token = this.store.getState()[this.reducerName];
    if (callback) callback(null, token);
  }
}

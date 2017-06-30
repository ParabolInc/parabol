import {Environment, Network, RecordSource, Store} from 'relay-runtime';

class RelayEnv {
  constructor() {
    this.store = new Store(new RecordSource());
  }

  get() {
    return this.wsEnv || this.httpEnv;
  }

  setHTTP(fetchQuery) {
    this.set(fetchQuery, 'httpEnv');
  }

  setWS(fetchQuery) {
    this.set(fetchQuery, 'wsEnv');
  }

  set(fetchQuery, env) {
    this[env] = new Environment({
      network: Network.create(fetchQuery),
      store: this.store
    });
  }

  clear(env) {
    if (env) {
      this[env] = null;
    } else {
      this.store = null;
      this.wsEnv = null;
      this.httpEnv = null;
    }
  }
}

export default new RelayEnv();

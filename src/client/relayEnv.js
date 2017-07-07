import {requestSubscription} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';

const getKey = (text, variables) => {
  const variablesString = variables ? JSON.stringify(variables) : '';
  return `${text}${variablesString}`;
};

class RelayEnv {
  constructor() {
    let counter = 0;
    this.authToken = undefined;
    this.httpEnv = undefined;
    this.wsEnv = undefined;
    this.store = new Store(new RecordSource());
    this.idLookup = {};
    this.generateId = () => counter++;
  }

  get() {
    return this.wsEnv || this.httpEnv;
  }

  fetchHTTP = (operation, variables, cacheConfig, uploadables) => {
    return fetch('/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        query: operation.text,
        variables
      })
    }).then(response => {
      return response.json();
    });
  };

  fetchWS = (operation, variables, cacheConfig, uploadables) => {
    return new Promise((resolve) => {
      const request = {
        query: operation.text,
        variables
      };
      this.socket.emit('graphql', request, (error, response) => {
        resolve(response);
      });
    });
  };

  setHTTPAuth(authToken) {
    this.authToken = authToken;
    this.httpEnv = new Environment({
      network: Network.create(this.fetchHTTP),
      store: this.store
    });
  }

  setWS(socket) {
    this.socket = socket;
    this.wsEnv = new Environment({
      network: Network.create(this.fetchWS, this.subscribe),
      store: this.store
    });
  }

  subscribe = (operation, variables, cacheConfig, observer) => {
    const {text} = operation;
    const key = getKey(text, variables);
    const opId = this.idLookup[key];
    if (!key) {
      throw new Error(`No key found for ${text} ${variables}`);
    }
    const request = {
      query: text,
      variables,
      // used as a per-client UID for unsubbing & preventing dupes
      opId
    };
    this.socket.on('gqlData', (gqlResponse) => {
      observer.onNext(gqlResponse);
    });
    this.socket.emit('gqlSub', request);
  };

  ensureSubscription(config) {
    const {subscription, variables} = config;
    const {text} = subscription();
    const key = getKey(text, variables);
    const opId = this.idLookup[key];
    if (opId === undefined) {
      this.idLookup[key] = this.generateId();
      requestSubscription(this.wsEnv, config);
    }
    return () => this.unsubscribe(key);
  }

  unsubscribe = (key) => {
    const opId = this.idLookup[key];
    this.socket.emit('gqlUnsub', opId);
    delete this.idLookup[key];
  };

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

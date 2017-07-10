import {requestSubscription} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import stableJSONStringify from 'relay-runtime/lib/stableJSONStringify';
import {requestIdleCallback} from 'universal/utils/requestIdleCallback';


export default class Atmosphere extends Environment {
  static getKey = (name, variables) => {
    return stableJSONStringify({name, variables});
  };

  constructor() {
    // deal with Environment
    const store = new Store(new RecordSource());
    super({store});
    this._network = Network.create(this.fetchHTTP);

    // now atmosphere
    this.index = 0;
    this.authToken = undefined;
    this.socket = undefined;
    this.networks = {
      http: this._network,
      socket: Network.create(this.fetchWS, this.socketSubscribe)
    };

    this.subLookup = {};
    this.gcSubs = {};
    this.gcTTL = {};
  }

  addNet = (name, network) => {
    this.networks[name] = network;
    this.setNet(name);
  };

  setNet = (name) => {
    this._network = this.networks[name];
  };

  fetchHTTP = async (operation, variables, cacheConfig) => {
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        query: operation.text,
        variables
      })
    });
    return res.json();
  };

  fetchWS = async (operation, variables, cacheConfig) => {
    return new Promise((resolve) => {
      this.socket.emit('graphql', {query: operation.text, variables}, (err, response) => {
        resolve(response);
      });
    })
  };

  setAuthToken = (authToken) => {
    this.authToken = authToken;
  };

  setSocket = (socket) => {
    this.socket = socket;
    this.setNet('socket');
  };

  socketSubscribe = (operation, variables, cacheConfig, observer) => {
    const {name, text} = operation;
    const key = Atmosphere.getKey(name, variables);
    const opId = this.subLookup[key];
    if (!key) {
      throw new Error(`No key found for ${name} ${variables}`);
    }
    this.socket.on(`gqlData.${opId}`, (gqlResponse) => {
      if (gqlResponse) {
        observer.onNext(gqlResponse);
      } else {
        // the server kicked us out
        this.socketUnsubscribe(key, true);
        // the sub might wanna pop a toast or do something fancy
        if (observer.onCompleted) {
          observer.onCompleted();
        }
      }
    });
    this.socket.emit('gqlSub', {
      query: text,
      variables,
      opId
    });
  };

  ensureSubscription = (config) => {
    const {subscription, variables} = config;
    const {name} = subscription();
    const key = Atmosphere.getKey(name, variables);
    const opId = this.subLookup[key];
    if (opId === undefined) {
      this.subLookup[key] = this.index++;
      requestSubscription(this, config);
    }
    return () => this.socketUnsubscribe(key);
  }

  socketUnsubscribe = (subKey, serverInitiated) => {
    const opId = this.subLookup[subKey];
    this.socket.off(`gqlData.${opId}`);
    delete this.subLookup[subKey];
    const dispose = this.gcSubs[subKey];
    if (dispose) {
      requestIdleCallback(() => {
        dispose();
      })
    }
    if (!serverInitiated) {
      this.socket.emit('gqlUnsub', opId);
    }
  };
};
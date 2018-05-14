import jwtDecode from 'jwt-decode';
import {requestSubscription} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import {APP_TOKEN_KEY, GQL_START, NEW_AUTH_TOKEN} from 'universal/utils/constants';
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription';
import EventEmitter from 'eventemitter3';
import handlerProvider from 'universal/utils/relay/handlerProvider';
import {SubscriptionClient} from 'subscriptions-transport-ws/dist/index';

const defaultErrorHandler = (err) => {
  console.error('Captured error:', err);
};

export default class Atmosphere extends Environment {
  static getKey = (name, variables) => {
    return JSON.stringify({name, variables});
  };

  registerQuery = async (queryKey, subscriptions, subParams, queryVariables, queryFetcher) => {
    const subConfigs = subscriptions.map((subCreator) => subCreator(this, queryVariables, subParams));
    const subscriptionClient = await this.ensureSubscriptionClient();
    if (!subscriptionClient) return;
    const newQuerySubs = subConfigs.map((config) => {
      const {subscription, variables = {}} = config;
      const {name} = subscription();
      const subKey = JSON.stringify({name, variables});
      const isRequested = Boolean(this.querySubscriptions.find((qs) => qs.subKey === subKey));
      if (!isRequested) {
        requestSubscription(this, {onError: defaultErrorHandler, ...config});
      }
      return {
        subKey,
        queryKey,
        queryFetcher
      };
    });

    this.querySubscriptions.push(...newQuerySubs);
  };

  constructor() {
    // deal with Environment
    const store = new Store(new RecordSource());
    super({store, handlerProvider});
    this._network = Network.create(this.fetchHTTP);

    // now atmosphere
    this.authToken = undefined;
    this.authObj = undefined;
    this.subscriptionClient = undefined;
    this.networks = {
      http: this._network,
      socket: Network.create(this.fetchWS, this.socketSubscribe)
    };
    this.querySubscriptions = [];
    this.subscriptions = {};
    this.eventEmitter = new EventEmitter();
  }

  socketSubscribe = async (operation, variables, cacheConfig, observer) => {
    const {name, text} = operation;
    const subKey = Atmosphere.getKey(name, variables);

    const onNext = (result) => {
      observer.onNext(result);
    };

    const onError = (error) => {
      observer.onError(error);
    };

    const onComplete = () => {
      observer.onCompleted();
    };
    const subscriptionClient = await this.ensureSubscriptionClient();
    if (!subscriptionClient) return undefined;

    const client = subscriptionClient
      .request({query: text, variables})
      .subscribe(onNext, onError, onComplete);

    this.subscriptions[subKey] = {
      client
    };
    return this.makeDisposable(subKey);
  };

  makeSubscriptionClient() {
    if (!this.authToken) {
      throw new Error('No Auth Token provided!');
    }
    const wsProtocol = window.location.protocol.replace('http', 'ws');
    const url = `${wsProtocol}//${window.location.host}/?token=${this.authToken}`;
    const subscriptionClient = new SubscriptionClient(url, {reconnect: true});

    const {text: query, name: operationName} = NewAuthTokenSubscription().subscription();
    subscriptionClient.operations[NEW_AUTH_TOKEN] = {
      handler: (errors, payload) => {
        const {authToken} = payload;
        this.setAuthToken(authToken);
      },
      options: {
        query,
        operationName
      }
    };
    return subscriptionClient;
  }

  fetchWS = async (operation, variables) => {
    return new Promise((resolve, reject) => {
      const opId = this.subscriptionClient.generateOperationId();
      const payload = {
        query: operation.text,
        variables
      };
      this.subscriptionClient.operations[opId] = {
        options: payload,
        handler: (errors, result) => {
          // errors only exist if GQL_ERROR is sent
          delete this.subscriptionClient.operations[opId];
          if (result) {
            resolve(result);
          } else {
            reject(errors && errors[0]);
          }
        }
      };
      this.subscriptionClient.sendMessage(opId, GQL_START, payload);
    });
  };

  setNet = (name) => {
    this._network = this.networks[name];
  };

  fetchHTTP = async (operation, variables) => {
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

  setSocket = () => {
    this.querySubscriptions = [];
    this.subscriptions = {};
    this.setNet('socket');
  };

  getAuthToken = (global) => {
    if (!global) return;
    const authToken = global.localStorage.getItem(APP_TOKEN_KEY);
    this.setAuthToken(authToken);
  };

  setAuthToken = (authToken) => {
    this.authToken = authToken;
    if (!authToken) return;
    this.authObj = jwtDecode(authToken);
    const {exp, sub: viewerId} = this.authObj;
    if (exp < (Date.now() / 1000)) {
      this.authToken = null;
      this.authObj = null;
      window.localStorage.removeItem(APP_TOKEN_KEY);
    } else {
      this.viewerId = viewerId;
      window.localStorage.setItem(APP_TOKEN_KEY, authToken);
      // deprecated! will be removed soon
      this.userId = viewerId;
    }
  };

  /*
   * When a subscription encounters an error, it affects the subscription itself,
   * the queries that depend on that subscription to stay valid,
   * and the peer subscriptions that also keep that component valid.
   *
   * For example, in my app component A subscribes to 1,2,3, component B subscribes to 1, component C subscribes to 2,4.
   * If subscription 1 fails, then the data for component A and B get released on unmount (or immediately, if already unmounted)
   * Subscription 1 gets unsubscribed,
   * Subscription 2 does not because it is used by component C.
   * Subscription 3 does because no other component depends on it.
   * Subscription 4 does not because it is a k > 1 nearest neighbor
   */
  makeDisposable = (subKeyToRemove) => {
    return {
      dispose: () => {
        // get every query that is powered by this subscription
        const associatedQueries = this.querySubscriptions.filter(({subKey}) => subKey === subKeyToRemove);
        // these queries are no longer supported, so drop them
        associatedQueries.forEach(({queryFetcher}) => {
          if (queryFetcher.readyToGC()) {
            queryFetcher.dispose();
          } else {
            queryFetcher.flagForGC();
          }
        });
        const queryKeys = associatedQueries.map(({queryKey}) => queryKey);
        this.unregisterQuery(queryKeys);
      }
    };
  };

  unregisterQuery = (maybeQueryKeys) => {
    const queryKeys = Array.isArray(maybeQueryKeys) ? maybeQueryKeys : [maybeQueryKeys];

    // for each query that is no longer 100% supported, find the subs that power them
    const peerSubs = this.querySubscriptions.filter(({queryKey}) => queryKeys.includes(queryKey));

    // get a unique list of the subs to release & maybe unsub
    const peerSubKeys = Array.from(new Set(peerSubs.map(({subKey}) => subKey)));

    peerSubKeys.forEach((subKey) => {
      // for each peerSubKey, see if there exists a query that is not affected.
      const unaffectedQuery = this.querySubscriptions.find((qs) => qs.subKey === subKey && !queryKeys.includes(qs.queryKey));
      if (!unaffectedQuery) {
        this.subscriptions[subKey].client.unsubscribe();
      }
    });

    this.querySubscriptions = this.querySubscriptions.filter((qs) => {
      return !peerSubKeys.includes(qs.subKey) || !queryKeys.includes(qs.queryKey);
    });
  };

  async ensureSubscriptionClient() {
    if (!this.subscriptionClientPromise) {
      this.subscriptionClientPromise = new Promise((resolve) => {
        this.subscriptionClient = this.makeSubscriptionClient();
        this.eventEmitter.emit('newSubscriptionClient');
        this._onceConnecting = () => {
          if (this.networks.socket !== this._network) {
            this.setNet('socket');
          }
          this.subscriptionClient.eventEmitter.off('socketsDisabled', this._onceSocketsDisabled);
          this._onceSocketsDisabled = undefined;
          resolve(this.subscriptionClient);
        };
        this._onceSocketsDisabled = () => {
          this.subscriptionClient.eventEmitter.off('connecting', this._onceConnecting);
          this._onceConnecting = undefined;
          resolve(null);
        };
        this.subscriptionClient.eventEmitter.once('connecting', this._onceConnecting);
        this.subscriptionClient.eventEmitter.once('socketsDisabled', this._onceSocketsDisabled);
      });
    }
    return this.subscriptionClientPromise;
  }
}

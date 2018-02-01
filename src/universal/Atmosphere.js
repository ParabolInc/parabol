import jwtDecode from 'jwt-decode';
import {requestSubscription} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import stableJSONStringify from 'relay-runtime/lib/stableJSONStringify';
import tryParse from 'universal/utils/tryParse';
import {SubscriptionClient} from 'subscriptions-transport-ws';

const makeErrorObj = (errors) => {
  const firstError = errors[0].message;
  return tryParse(firstError) ||
    errors.reduce((errObj, err, idx) => {
      const prop = idx === 0 ? '_error' : idx;
      errObj[prop] = err.message;
      return errObj;
    }, {});
};

const defaultErrorHandler = (err) => {
  console.error('Captured error:', err);
};

export default class Atmosphere extends Environment {
  static getKey = (name, variables) => {
    return stableJSONStringify({name, variables});
  };

  fetchWS = async (operation, variables) => {
    const request = this.subscriptionClient
      .request({query: operation.text, variables});
    return new Promise((resolve, reject) => {
      request.subscribe({
        // next: reject,
        // next: ((data) => {
        //   setTimeout(() => resolve(data), 1000)
        // }),
        next: resolve,
        error: reject
      });
    });
  };

  // use = (networkName) => {
  //   // TODO build this out when we start hitting github directly
  //   return this.environments[networkName];
  // };

  // addNet = (name, network) => {
  //   this.networks[name] = network;
  //   this.setNet(name);
  // };

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
    const resJson = await res.json();
    const {errors} = resJson;
    if (!errors) return resJson;
    const errorObj = makeErrorObj(errors);
    return Promise.reject(errorObj);
  };
  setSocket = (socket) => {
    // this.opIdIndex = 1;
    this.querySubscriptions = [];
    this.subscriptions = {};
    this.socket = socket;
    this.setNet('socket');
    // this.socket.on(GQL_DATA, this.handleGQLData);
    // this.socket.on(GQL_ERROR, this.handleGQLError);
    // this.socket.on(GQL_COMPLETE, this.handleGQLComplete);
  };

  setAuthToken = (authToken) => {
    this.authToken = authToken;
    if (authToken) {
      const authObj = jwtDecode(authToken);
      this.userId = authObj.sub;
      this.viewerId = authObj.sub;
    }
  };
  socketSubscribe = (operation, variables, cacheConfig, observer) => {
    const {name, text} = operation;
    const subKey = Atmosphere.getKey(name, variables);
    // const opId = this.opIdIndex++;

    const onNext = (result) => {
      observer.onNext(result)
    };

    const onError = (error) => {
      observer.onError(error)
    };

    const onComplete = () => {
      observer.onCompleted()
    };
    if (!this.subscriptionClient) {
      this.setSocket();
      if (!this.authToken) {
        throw new Error('No Auth Token provided!');
      }
      this.subscriptionClient = new SubscriptionClient(`ws://${window.location.host}/graphql`, {
        reconnect: true,
        lazy: true,
        connectionParams: {authToken: this.authToken}
      });
    }
    const client = this.subscriptionClient
      .request({query: text, variables})
      .subscribe(onNext, onError, onComplete);

    this.subscriptions[subKey] = {
      client
    };
    console.log('unsub', client);
    // this.emitSubscribe(text, variables, opId);
    return this.makeDisposable(subKey);
  };

  // getSubscription(opId) {
  //   const subscription = this.subscriptions[opId];
  //   // In the future, it might be nice to store this in a queue that we can retry in a few ms
  //   if (!subscription) {
  //     throw new Error(`No subscription set up for opId ${opId}`);
  //   }
  //   return subscription;
  // }

  // handleGQLComplete = (message) => {
  //   const {opId} = message;
  //   const {observer} = this.getSubscription(opId);
  //   if (observer.onCompleted) {
  //     observer.onCompleted();
  //   }
  // };
  // handleGQLData = (message) => {
  //   const {opId, payload} = message;
  //   const {observer} = this.getSubscription(opId);
  //   observer.onNext(payload);
  // };
  // handleGQLError = (message) => {
  //   const {opId, payload} = message;
  //   const {errors} = payload;
  //   const {observer} = this.getSubscription(opId);
  //   const errorObj = makeErrorObj(errors);
  //   observer.onError(errorObj);
  // };
  //
  // emitSubscribe = (query, variables, opId) => {
  //   this.socket.emit(GQL_START, {
  //     query,
  //     variables,
  //     opId
  //   });
  // };
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
        associatedQueries.forEach(({component}) => {
          const {dispose} = component;
          if (dispose) {
            dispose();
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
        // const opId = this.findOpId(subKey);
        // if (opId === undefined) return;
        // TODO
        this.subscriptions[subKey].client.unsubscribe();
        // this.socket.emit(GQL_STOP, opId);
      }
    });

    this.querySubscriptions = this.querySubscriptions.filter((qs) => {
      return !peerSubKeys.includes(qs.subKey) || !queryKeys.includes(qs.queryKey);
    });
  };

  registerQuery = (queryKey, subscriptions, subParams, queryVariables, releaseComponent) => {
    const subConfigs = subscriptions.map((subCreator) => subCreator(this, queryVariables, subParams));
    const newQuerySubs = subConfigs.map((config) => {
      const {subscription, variables = {}} = config;
      const {name} = subscription();
      const subKey = Atmosphere.getKey(name, variables);
      const existingSub = this.querySubscriptions.find((qs) => qs.subKey === subKey);
      this.setSocket();
      const disposable = existingSub ? existingSub.subscription :
        requestSubscription(this, {onError: defaultErrorHandler, ...config});
      return {
        subKey,
        queryKey,
        component: {dispose: releaseComponent},
        subscription: disposable
      };
    });

    this.querySubscriptions.push(...newQuerySubs);
  };

  // findOpId(subKey) {
  //   const opIds = Object.keys(this.subscriptions);
  //   for (let ii = 0; ii < opIds.length; ii++) {
  //     const opId = opIds[ii];
  //     if (this.subscriptions[opId].subKey === subKey) return opId;
  //   }
  //   return undefined;
  // }

  constructor() {
    // deal with Environment
    const store = new Store(new RecordSource());
    super({store});
    this._network = Network.create(this.fetchHTTP);

    // now atmosphere
    this.authToken = undefined;
    this.socket = undefined;
    this.subscriptionClient = undefined;
    this.networks = {
      http: this._network,
      socket: Network.create(this.fetchWS, this.socketSubscribe)
    };

    // this.opIdIndex = 1;
    this.querySubscriptions = [];
    this.subscriptions = {};
  }
}

import jwtDecode from 'jwt-decode';
import {requestSubscription} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import stableJSONStringify from 'relay-runtime/lib/stableJSONStringify';
import toGlobalId from 'universal/utils/relay/toGlobalId';
import tryParse from 'universal/utils/tryParse';

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

  constructor() {
    // deal with Environment
    const store = new Store(new RecordSource());
    super({store});
    this._network = Network.create(this.fetchHTTP);

    // now atmosphere
    this.opIdIndex = 0;
    this.authToken = undefined;
    this.socket = undefined;
    this.networks = {
      http: this._network,
      socket: Network.create(this.fetchWS, this.socketSubscribe)
    };

    this.subLookup = {};
    this.querySubscriptions = [];
  }

  use = (networkName) => {
    // TODO build this out when we start hitting github directly
    return this.environments[networkName];
  };

  addNet = (name, network) => {
    this.networks[name] = network;
    this.setNet(name);
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
    const resJson = await res.json();
    const {errors} = resJson;
    if (!errors) return resJson;
    const errorObj = makeErrorObj(errors);
    return Promise.reject(errorObj);
  };

  fetchWS = async (operation, variables) => {
    return new Promise((resolve, reject) => {
      this.socket.emit('graphql', {query: operation.text, variables}, (_, response) => {
        const {errors} = response;
        if (errors) {
          const errorObj = makeErrorObj(errors);
          reject(errorObj);
        } else {
          // reject({_error: 'A really big one'})
          // setTimeout(() => resolve(response), 2000);
          resolve(response);
        }
      });
    });
  };

  setAuthToken = (authToken) => {
    this.authToken = authToken;
    if (authToken) {
      const authObj = jwtDecode(authToken);
      this.userId = authObj.sub;
      this.viewerId = toGlobalId('User', authObj.sub);
    }
  };

  setSocket = (socket) => {
    this.socket = socket;
    this.setNet('socket');
  };

  emitSubscribe = (query, variables, opId) => {
    this.socket.emit('gqlSub', {
      query,
      variables,
      opId
    });
  };

  socketSubscribe = (operation, variables, cacheConfig, observer) => {
    const {name, text} = operation;
    const subKey = Atmosphere.getKey(name, variables);
    const opId = this.opIdIndex++;
    this.subLookup[subKey] = opId;
    const socketChannel = `gqlData.${opId}`;
    const dispose = () => this.handleSubscriptionError(subKey);
    this.socket.on(socketChannel, (gqlResponse) => {
      if (gqlResponse) {
        const {errors} = gqlResponse;
        if (errors) {
          const errorObj = makeErrorObj(errors);
          observer.onError(errorObj);
          // this.handleSubscriptionError(subKey);
        } else {
          observer.onNext(gqlResponse);
        }
      } else {
        // resubscribe if we were kicked out. we probably got a new token, so try it again with the fresh one
        this.emitSubscribe(text, variables, opId);

        // this will call dispose
        // if (observer.onCompleted) {
        //  observer.onCompleted();
        // }
      }
    });
    this.emitSubscribe(text, variables, opId);
    // currently we don't use this disposable, but Relay does in the subscription observable.onError
    return {dispose};
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
  handleSubscriptionError = (subKeyWithError) => {
    // get every query that is powered by this subscription
    const associatedQueries = this.querySubscriptions.filter(({subKey}) => subKey === subKeyWithError);

    // these queries are no longer supported, so drop them
    associatedQueries.forEach(({component}) => {
      component.dispose();
    });

    const queryKeys = associatedQueries.map(({queryKey}) => queryKey);

    this.unregisterQuery(queryKeys);
  };

  registerQuery = (queryKey, subscriptions, subParams, queryVariables, releaseComponent) => {
    const subConfigs = subscriptions.map((subCreator) => subCreator(this, queryVariables, subParams));
    const newQuerySubs = subConfigs.map((config) => {
      const {subscription, variables = {}} = config;
      const {name} = subscription();
      const subKey = Atmosphere.getKey(name, variables);
      const existingSub = this.querySubscriptions.find((qs) => qs.subKey === subKey);
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
        const opId = this.subLookup[subKey];
        this.socket.off(`gqlData.${opId}`);
        this.socket.emit('gqlUnsub', opId);
      }
    });

    this.querySubscriptions = this.querySubscriptions.filter((qs) => {
      return !peerSubKeys.includes(qs.subKey) || !queryKeys.includes(qs.queryKey);
    });
  }
}

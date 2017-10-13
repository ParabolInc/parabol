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
    this.index = 0;
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

  registerQuery = (queryKey, subKeys, handleKickout) => {
    subKeys.forEach((subKey) => {
      this.querySubscriptions.push({
        queryKey,
        subKey,
        handleKickout
      });
    });
  };

  unregisterQuery = (queryKey) => {
    // unsubscribe from all subs that are no longer needed
    this.querySubscriptions.forEach((querySub) => {
      if (querySub.queryKey === queryKey) {
        this.safeSocketUnsubscribe(querySub.subKey);
      }
    });
    // remove all records relating to this query
    this.querySubscriptions = this.querySubscriptions.filter((querySub) => querySub.queryKey !== queryKey);
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
    const {opId} = this.subLookup[subKey];
    if (!subKey) {
      throw new Error(`No subKey found for ${name} ${variables}`);
    }
    this.socket.on(`gqlData.${opId}`, (gqlResponse) => {
      if (gqlResponse) {
        const {errors} = gqlResponse;
        if (errors) {
          const errorObj = makeErrorObj(errors);
          observer.onError(errorObj);
          return;
        }
        observer.onNext(gqlResponse);
      } else if (JSON.parse(subKey).name === 'NotificationsAddedSubscription') {
        // resubscribe without the client knowing we unsubbed when tms gets changed
        this.emitSubscribe(text, variables, opId);
      } else {
        this.socketUnsubscribe(subKey, true);
        // the sub might wanna pop a toast or do something fancy
        if (observer.onCompleted) {
          observer.onCompleted();
        }
      }
    });
    this.emitSubscribe(text, variables, opId);
    // currently we don't use this disposable, but Relay does in the subscription observable.onError
    return {dispose: () => this.safeSocketUnsubscribe(subKey)};
  };

  ensureSubscription = (config) => {
    const {subscription, variables = {}} = config;
    const {name} = subscription();
    const subKey = Atmosphere.getKey(name, variables);
    const opManager = this.subLookup[subKey];
    if (opManager === undefined) {
      this.subLookup[subKey] = {
        opId: this.index++
      };
      requestSubscription(this, {onError: defaultErrorHandler, ...config});
    } else {
      // another component cares about this subscription. if it tries to unsub, don't do it until both want to
      opManager.instances++;
    }
    return subKey;
  };

  safeSocketUnsubscribe = (subKey) => {
    // if this is the only query that cares about that sub, unsubscribe
    const queriesForSub = this.querySubscriptions.filter((qs) => qs.subKey === subKey);
    // the subLookup will be empty if this was a kickout
    if (queriesForSub.length === 1 && this.subLookup[subKey]) {
      this.socketUnsubscribe(subKey);
    }
  };

  socketUnsubscribe = (subKey, isKickout) => {
    const opManager = this.subLookup[subKey];
    if (!opManager) {
      throw new Error(`${subKey} does not exist. socketUnsubscribe was probably already called.`);
    }
    const {opId} = opManager;
    this.socket.off(`gqlData.${opId}`);
    delete this.subLookup[subKey];
    if (isKickout) {
      this.querySubscriptions.forEach((querySub) => {
        if (querySub.subKey === subKey) {
          querySub.handleKickout();
        }
      });
    } else {
      this.socket.emit('gqlUnsub', opId);
    }
  };
}

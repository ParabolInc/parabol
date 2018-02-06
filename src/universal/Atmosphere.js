import jwtDecode from 'jwt-decode';
import {requestSubscription} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import {setAuthToken} from 'universal/redux/authDuck';
import {NEW_AUTH_TOKEN} from 'universal/utils/constants';
import {showError, showSuccess, showWarning} from 'universal/modules/toast/ducks/toastDuck';
import raven from 'raven-js';
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription';
import popUpgradeAppToast from 'universal/mutations/toasts/popUpgradeAppToast';

const defaultErrorHandler = (err) => {
  console.error('Captured error:', err);
};

export default class Atmosphere extends Environment {
  static getKey = (name, variables) => {
    return JSON.stringify({name, variables});
  };

  registerQuery = (queryKey, subscriptions, subParams, queryVariables, releaseComponent) => {
    const subConfigs = subscriptions.map((subCreator) => subCreator(this, queryVariables, subParams));
    const newQuerySubs = subConfigs.map((config) => {
      const {subscription, variables = {}} = config;
      const {name} = subscription();
      const subKey = Atmosphere.getKey(name, variables);
      this.safeRequestSubscription(config);
      return {
        subKey,
        queryKey,
        component: {dispose: releaseComponent}
      };
    });

    this.querySubscriptions.push(...newQuerySubs);
  };
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

  constructor() {
    // deal with Environment
    const store = new Store(new RecordSource());
    super({store});
    this._network = Network.create(this.fetchHTTP);

    // now atmosphere
    this.authToken = undefined;
    this.subscriptionClient = undefined;
    this.networks = {
      http: this._network,
      socket: Network.create(this.fetchWS, this.socketSubscribe)
    };
    this.querySubscriptions = [];
    this.subscriptions = {};
    this.useSubscriptions = true;
  }

  makeSubscriptionClient() {
    if (!this.subscriptionClient) {
      this.subscriptionClient = new Promise((resolve, reject) => {
        const subscriptionClient = new SubscriptionClient(`ws://${window.location.host}/?token=${this.authToken}`, {
          reconnect: true
        });
        // Catch aggressive firewalls that block websockets
        subscriptionClient.client.onerror = (e) => {
          // if reconnecting, then websockets aren't blocked
          if (subscriptionClient.reconnecting) return;
          subscriptionClient.reconnect = false;
          reject(e);
        };

        subscriptionClient.client.onopen = () => {
          resolve(subscriptionClient);
          subscriptionClient.clearMaxConnectTimeout();
          subscriptionClient.closedByUser = false;
          subscriptionClient.eventEmitter.emit(subscriptionClient.reconnecting ? 'reconnecting' : 'connecting');
          subscriptionClient.flushUnsentMessagesQueue();
        };
      });
    }
    return this.subscriptionClient;
  }

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
    if (errors) {
      throw new Error(errors[0].message);
    }
    return resJson;
  };

  setSocket = () => {
    this.querySubscriptions = [];
    this.subscriptions = {};
    this.setNet('socket');
  };

  setAuthToken = (authToken) => {
    this.authToken = authToken;
    if (authToken) {
      const authObj = jwtDecode(authToken);
      this.userId = authObj.sub;
      this.viewerId = authObj.sub;
    }
  };

  async safeRequestSubscription(config) {
    const subscriptionClient = await this.ensureSubscriptionClient();
    return subscriptionClient && requestSubscription(this, {onError: defaultErrorHandler, ...config});
  }

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
        this.subscriptions[subKey].client.unsubscribe();
      }
    });

    this.querySubscriptions = this.querySubscriptions.filter((qs) => {
      return !peerSubKeys.includes(qs.subKey) || !queryKeys.includes(qs.queryKey);
    });
  };

  async ensureSubscriptionClient() {
    if (this.subscriptionClient && !this.subscriptionClient.then) return this.subscriptionClient;
    if (this.useSubscriptions === false) return null;
    if (!this.authToken) {
      throw new Error('No Auth Token provided!');
    }

    try {
      this.subscriptionClient = await this.makeSubscriptionClient();
    } catch (e) {
      if (this.useSubscriptions) {
        this.useSubscriptions = false;
        raven.captureBreadcrumb({
          category: 'network',
          level: 'error',
          message: 'WebSockets Disabled'
        });
        raven.captureException(e);

        this.dispatch(showError({
          autoDismiss: 0,
          title: 'WebSockets Disabled',
          message: `We weren't able to create a live connection to our server. 
          Ask your network administrator to enable WebSockets.`
        }));
      }
      return null;
    }
    if (this.networks.socket !== this._network) {
      this.setNet('socket');
      // notify when disconnected
      this.subscriptionClient.onDisconnected(() => {
        if (!this.subscriptionClient.reconnecting) {
          this.dispatch(showWarning({
            autoDismiss: 10,
            title: 'You’re offline!',
            message: 'We’re trying to reconnect you'
          }));
        }
      });

      // notify on reconnects
      const handleAck = (payload) => {
        const {version} = payload;
        popUpgradeAppToast(version, {dispatch: this.dispatch, history: this.history});
      };

      this.subscriptionClient.onReconnected((payload) => {
        handleAck(payload);
        this.dispatch(showSuccess({
          autoDismiss: 5,
          title: 'You’re back online!',
          message: 'You were offline for a bit, but we’ve reconnected you.'
        }));
      });
      this.subscriptionClient.onConnected(handleAck);

      // this is dirty, but removing auth state from redux is out of scope. we'll change it soon
      const {text: query, name: operationName} = NewAuthTokenSubscription().subscription();
      this.subscriptionClient.operations[NEW_AUTH_TOKEN] = {
        handler: (errors, payload) => {
          const {authToken} = payload;
          this.setAuthToken(authToken);
          this.dispatch(setAuthToken(authToken));
        },
        options: {
          query,
          operationName
        }
      };
    }
    return this.subscriptionClient;
  }
}

import Atmosphere from 'client/Atmosphere';
import deepFreeze from 'deep-freeze';
import areEqual from 'fbjs/lib/areEqual';
import PropTypes from 'prop-types';
import React from 'react';

const getStateWithProps = (props = null) => ({
  error: null,
  props,
  retry: null
});

const makeProps = (snapshotData, unsubscribe) => unsubscribe ? {...snapshotData, unsubscribe} : snapshotData;

const isCacheable = (subs, cacheConfig = {}) => subs || cacheConfig.force === false || cacheConfig.ttl;
// cacheable logic borrowed from https://github.com/robrichard/relay-query-lookup-renderer
export default class ReactRelayQueryRenderer extends React.Component {
  static propTypes = {
    cacheConfig: PropTypes.object,
    environment: PropTypes.object,
    query: PropTypes.func,
    render: PropTypes.func.isRequired,
    variables: PropTypes.object,
    subscriptions: PropTypes.arrayOf(PropTypes.func.isRequired).isRequired
  }

  constructor(props, context) {
    super(props, context);
    let {query, variables} = props;
    const {cacheConfig, environment, subscriptions} = props;
    let operation = null;
    if (query) {
      const {
        createOperationSelector,
        getOperation
      } = environment.unstable_internal;
      query = getOperation(query);
      operation = createOperationSelector(query, variables);
      variables = operation.variables;
    }
    const operationName = operation ? operation.name : 'queryless';
    this._queryKey = Atmosphere.getKey(operationName, variables);
    this._pendingFetch = null;
    this._relayContext = {
      environment,
      variables
    };
    this._rootSubscription = null;
    this._selectionReference = null;
    this.releaseOnUnmount = !subscriptions;
    if (!query) {
      this.state = getStateWithProps({});
    } else if (operation) {
      // environment.check is expensive, do everything we can to prevent a call
      if (isCacheable(subscriptions, cacheConfig) && environment.check(operation.root)) {
        // data is available in the store, render without making any requests
        const snapshot = environment.lookup(operation.fragment);
        this.state = {
          readyState: getStateWithProps(makeProps(snapshot.data, this.unsubscribe))
        };
      } else {
        this.state = {
          readyState: getStateWithProps()
        };
        this._fetch(operation, cacheConfig);
        this._subscribe(subscriptions);
      }
    }
  }

  getChildContext() {
    return {
      relay: this._relayContext
    };
  }

  componentWillReceiveProps(nextProps) {
    const {cacheConfig, environment, subscriptions, query, variables} = nextProps;
    if (
      query !== this.props.query ||
      environment !== this.props.environment ||
      !areEqual(variables, this.props.variables)
    ) {
      if (query) {
        const {
          createOperationSelector,
          getOperation
        } = environment.unstable_internal;
        const operation = createOperationSelector(
          getOperation(query),
          variables
        );
        this._relayContext = {
          environment,
          variables: operation.variables
        };
        if (isCacheable(subscriptions, cacheConfig) && environment.check(operation.root)) {
          const snapshot = environment.lookup(operation.fragment);
          this._onChange(snapshot);
        } else {
          this._fetch(operation, cacheConfig);
          this.setState({
            readyState: getStateWithProps()
          });
        }
      } else {
        this._relayContext = {
          environment,
          variables
        };
        this.release();
        this.setState(getStateWithProps({}));
      }
      // Note: cannot change the subscription array without changing vars
      if (this.unsubscribe) this.unsubscribe();
      if (subscriptions) {
        this._subscribe(subscriptions);
      }
    }

  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.render !== this.props.render ||
      nextState.readyState !== this.state.readyState
    );
  }

  componentWillUnmount() {
    const {cacheConfig, environment} = this.props;
    const {ttl} = cacheConfig || {};
    if (this.releaseOnUnmount) {
      this.release();
      environment.unregisterQuery(this._queryKey);
      return;
    }

    environment.querySubscriptions.forEach((querySub) => {
      if (querySub.queryKey === this._queryKey) {

      }
    })
    // if the subscription is still going, then GC the query when the subscription ends
    this.subKeys.forEach((subKey) => {
      environment.subLookup[subKey].unsubListeners.push(this.release);
    });

    // if the client is unlikely to return after X, the subscription has a TTL of X
    // when that time has be reached, then we unsub
    if (ttl) {
      setTimeout(() => {
        if (this.unsubscribe) this.unsubscribe();
      }, ttl);
    }
  }

  setReleaseOnUnmount = () => {
    this.releaseOnUnmount = true;
  };

  release = () => {
    if (this._pendingFetch) {
      this._pendingFetch.dispose();
      this._pendingFetch = null;
    }
    if (this._rootSubscription) {
      this._rootSubscription.dispose();
      this._rootSubscription = null;
    }
    if (this._selectionReference) {
      this._selectionReference.dispose();
      this._selectionReference = null;
    }
  };

  _subscribe(subscriptions) {
    if (subscriptions) {
      const {environment, variables} = this._relayContext;
      // subscribe to each new sub, or return the subKey of an already existing sub
      const subscriptionKeys = subscriptions.map((sub) => sub(environment, variables));
      // when unsubscribe gets called on a sub, the query is stale, so make sure it gets GC'd on unmount
      subscriptionKeys.forEach((subKey) => {
        environment.querySubscriptions.push({
          queryKey: this._queryKey,
          subKey,
          release: this.setReleaseOnUnmount
        });
      });
      // provide an unsub prop to the component so we can unsub whenever we want
      // when we call unsub we want to:
      //   release immediately if component is unmounted
      //   set releaseOnUnmount to true
      this.unsubscribe = () => {
        // get all the subs for this particular query
        environment.querySubscriptions
          .filter((querySub) => querySub.querySub === this._queryKey)
          .forEach((querySub) => {
            // release it
            querySub.release();
            // if this is the only query that cares about that sub, unsubscribe
            const queriesForSub = environment.querySubscriptions.filter((qs) => qs.subKey === querySub.subKey);
            if (queriesForSub.length === 1) {
              environment.socketUnsubscribe(querySub.subKey);
            }
          });
        // remove from listeners
        environment.unregisterQuery(this._queryKey);
        this.unsubscribe = undefined;
      };
    }
  }

  _fetch(operation, cacheConfig) {
    const {environment} = this._relayContext;

    // Immediately retain the results of the new query to prevent relevant data
    // from being freed. This is not strictly required if all new data is
    // fetched in a single step, but is necessary if the network could attempt
    // to incrementally load data (ex: multiple query entries or incrementally
    // loading records from disk cache).
    const nextReference = environment.retain(operation.root);

    let readyState = getStateWithProps();
    let snapshot; // results of the root fragment
    const onCompleted = () => {
      this._pendingFetch = null;
    };
    const onError = (error) => {
      readyState = {
        error,
        props: null,
        retry: () => {
          this._fetch(operation, cacheConfig);
        }
      };
      if (this._selectionReference) {
        this._selectionReference.dispose();
      }
      this._pendingFetch = null;
      this._selectionReference = nextReference;
      this.setState({readyState});
    };
    const onNext = () => {
      // `onNext` can be called multiple times by network layers that support
      // data subscriptions. Wait until the first payload to render `props` and
      // subscribe for data updates.
      if (snapshot) {
        return;
      }
      snapshot = environment.lookup(operation.fragment);
      readyState = {
        error: null,
        props: makeProps(snapshot.data, this.unsubscribe),
        retry: () => {
          this._fetch(operation, cacheConfig);
        }
      };

      if (this._selectionReference) {
        this._selectionReference.dispose();
      }
      this._rootSubscription = environment.subscribe(snapshot, this._onChange);
      this._selectionReference = nextReference;
      this.setState({readyState});
    };

    if (this._pendingFetch) {
      this._pendingFetch.dispose();
    }
    if (this._rootSubscription) {
      this._rootSubscription.dispose();
    }
    const request = environment.streamQuery({
      cacheConfig,
      onCompleted,
      onError,
      onNext,
      operation
    });
    this._pendingFetch = {
      dispose() {
        request.dispose();
        nextReference.dispose();
      }
    };
  }

  _onChange = (snapshot) => {
    this.setState({
      readyState: {
        ...this.state.readyState,
        props: snapshot.data
      }
    });
  };

  render() {
    // Note that the root fragment results in `readyState.props` is already
    // frozen by the store; this call is to freeze the readyState object and
    // error property if set.
    if (process.env.NODE_ENV !== 'production') {
      deepFreeze(this.state.readyState);
    }
    return this.props.render(this.state.readyState);
  }
}

ReactRelayQueryRenderer.childContextTypes = {
  relay: PropTypes.object.isRequired
};


import Atmosphere from 'universal/Atmosphere';
import deepFreeze from 'deep-freeze';
import areEqual from 'fbjs/lib/areEqual';
import PropTypes from 'prop-types';
import React from 'react';
import {MAX_INT} from 'universal/utils/constants';

const getStateWithProps = (props = null) => ({
  error: null,
  props,
  retry: null
});

const makeProps = (snapshotData, unsubscribe) => unsubscribe ? {...snapshotData, unsubscribe} : snapshotData;

const isCacheable = (subs, cacheConfig = {}) => subs || cacheConfig.force === false || cacheConfig.ttl;
// cacheable logic borrowed from https://github.com/robrichard/relay-query-lookup-renderer
export default class QueryRenderer extends React.Component {
  static propTypes = {
    cacheConfig: PropTypes.object,
    environment: PropTypes.object,
    query: PropTypes.func,
    render: PropTypes.func.isRequired,
    variables: PropTypes.object,
    subscriptions: PropTypes.arrayOf(PropTypes.func.isRequired),
    subParams: PropTypes.object
  };

  static contextTypes = {
    store: PropTypes.object
  };

  static timeouts = {};

  constructor(props, context) {
    super(props, context);
    let {query, variables} = props;
    const {cacheConfig, environment, subscriptions, subParams} = props;
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
    clearTimeout(QueryRenderer.timeouts[this._queryKey]);
    delete QueryRenderer.timeouts[this._queryKe];

    this._pendingFetch = null;
    this._relayContext = {
      environment,
      variables
    };
    this._rootSubscription = null;
    this._selectionReference = null;
    this.releaseOnUnmount = !subscriptions;
    this._mounted = true;
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
        this._subscribe(subscriptions, subParams);
      }
    }
  }

  getChildContext() {
    return {
      relay: this._relayContext
    };
  }

  componentWillReceiveProps(nextProps) {
    const {cacheConfig, environment, subscriptions, subParams, query, variables} = nextProps;
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
          this.release();
          this._fetch(operation, cacheConfig);
          // Note: cannot change the subscription array without changing vars
          this._subscribe(subscriptions, subParams);
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
    this._mounted = false;
    if (this.releaseOnUnmount) {
      this.release();
      return;
    }
    environment.querySubscriptions.forEach((querySub) => {
      if (querySub.queryKey === this._queryKey) {
        querySub.handleKickout = this.unsubscribe;
      }
    });
    // if the client is unlikely to return after X, the subscription has a TTL of X
    // when that time has be reached, then we unsub
    if (ttl !== undefined && ttl <= MAX_INT) {
      const {timeouts} = QueryRenderer;
      timeouts[this._queryKey] = setTimeout(() => {
        this.release();
        delete timeouts[this._queryKey];
      }, ttl);
    }
  }

  safelySetState(stateObj) {
    // make sure the component didn't unmount before the fetch returned
    if (this._mounted) {
      this.setState(stateObj);
    }
  }

  release = () => {
    const {environment} = this._relayContext;
    // remove from listeners
    environment.unregisterQuery(this._queryKey);

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

  _subscribe(subscriptions, subParams) {
    if (subscriptions) {
      const {environment, variables} = this._relayContext;
      // subscribe to each new sub, or return the subKey of an already existing sub
      const subscriptionKeys = subscriptions.map((sub) => sub(environment, variables, subParams));
      // provide an unsub prop to the component so we can unsub whenever we want
      // when we call unsub we want to:
      //   release immediately if component is unmounted
      //   set releaseOnUnmount to true if component is still mounted
      //
      this.unsubscribe = () => {
        if (this._mounted) {
          this.releaseOnUnmount = true;
        } else {
          this.release();
        }
      };
      // note that the reference to `this` could be a memory leak since these components are never released
      // to minimize memory, we could make a `releaseFactory` that takes in the disposers
      environment.registerQuery(this._queryKey, subscriptionKeys, this.unsubscribe);
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
      this.safelySetState({readyState});
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
      this.safelySetState({readyState});
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
    this.safelySetState({
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

QueryRenderer.childContextTypes = {
  relay: PropTypes.object.isRequired
};


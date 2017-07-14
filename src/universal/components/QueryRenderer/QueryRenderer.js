import deepFreeze from 'deep-freeze';
import areEqual from 'fbjs/lib/areEqual';
import PropTypes from 'prop-types';
import React from 'react';

const getStateWithProps = (props = null) => ({
  error: null,
  props,
  retry: null
});

const isCacheable = (cacheConfig = {}) => cacheConfig.force === false || cacheConfig.sub || cacheConfig.ttl;
// cacheable logic borrowed from https://github.com/robrichard/relay-query-lookup-renderer
export default class ReactRelayQueryRenderer extends React.Component {
  static propTypes = {
    cacheConfig: PropTypes.object,
    environment: PropTypes.object,
    query: PropTypes.func,
    render: PropTypes.func.isRequired,
    variables: PropTypes.object
  }

  constructor(props, context) {
    super(props, context);
    let {query, variables} = props;
    const {cacheConfig, environment} = props;
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
    this._pendingFetch = null;
    this._relayContext = {
      environment,
      variables
    };
    this._rootSubscription = null;
    this._selectionReference = null;

    if (!query) {
      this.state = getStateWithProps({});
    } else if (operation) {
      if (isCacheable(cacheConfig) && environment.check(operation.root)) {
        // data is available in the store, render without making any requests
        const snapshot = environment.lookup(operation.fragment);
        this.state = {
          readyState: getStateWithProps(snapshot.data)
        };
      } else {
        this.state = {
          readyState: getStateWithProps()
        };
        this._fetch(operation, cacheConfig);
      }
    }
    // any time we change routes, let's remove the stale data
    requestIdleCallback(() => {
      const expirations = Object.keys(environment.gcTTL).filter((exp) => exp < Date.now());
      for (let i = 0; i < expirations.length; i++) {
        const exp = expirations[i];
        environment.gcTTL[exp]();
        delete environment.gcTTL[exp];
      }
    });
  }

  getChildContext() {
    return {
      relay: this._relayContext
    };
  }

  componentWillReceiveProps(nextProps) {
    const {cacheConfig, environment, query, variables} = nextProps;
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
        this._operation = operation;
        this._relayContext = {
          environment,
          variables: operation.variables
        };
        if (isCacheable(cacheConfig) && environment.check(operation.root)) {
          const snapshot = environment.lookup(operation.fragment);
          this._onChange(snapshot);
        } else {
          this._fetch(operation, cacheConfig);
          this.setState({
            readyState: getStateWithProps()
          });
        }
      } else {
        this._operation = null;
        this._relayContext = {
          environment,
          variables
        };
        this._release();
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
    const {sub, ttl} = cacheConfig || {};
    if (sub || ttl) {
      const pendingFetch = this._pendingFetch;
      const rootSubscription = this._rootSubscription;
      const selectionReference = this._selectionReference;
      const release = () => {
        if (pendingFetch) pendingFetch.dispose();
        if (rootSubscription) rootSubscription.dispose();
        if (selectionReference) selectionReference.dispose();
      };
      if (sub) {
        environment.gcSubs[sub] = release;
      }
      if (ttl) {
        const exp = Date.now() + ttl;
        environment.gcTTL[exp] = release;
      }
    } else {
      this._release();
    }
  }

  _release() {
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
        props: snapshot.data,
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


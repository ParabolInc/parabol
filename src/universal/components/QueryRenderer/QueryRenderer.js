import deepFreeze from 'deep-freeze';
import areEqual from 'fbjs/lib/areEqual';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Taken from react-relay QueryRenderer with one addition.
 * - lookup prop will check the relay store for data first and if present will
 * immediately call `render` with props.
 *
 * This will not be necessary if this PR is merged:
 * https://github.com/facebook/relay/pull/1760
 */
class ReactRelayQueryRenderer extends React.Component {
  constructor(props, context) {
    super(props, context);
    let {query, variables, lookup} = props;
    const environment = props.environment;
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

    this._mounted = false;
    this._operation = operation;
    this._pendingFetch = null;
    this._relayContext = {
      environment,
      variables
    };
    this._rootSubscription = null;
    this._selectionReference = null;

    if (operation) {
      if (lookup && environment.check(operation.root)) {
        // data is available in the store, render without making any requests
        const snapshot = environment.lookup(operation.fragment);
        this.state = {
          readyState: {
            error: null,
            props: snapshot.data,
            retry: () => {
              this._fetch(operation, props.cacheConfig);
            }
          }
        };
      } else {
        this.state = {
          readyState: getDefaultState()
        };
        this._fetch(operation, props.cacheConfig);
      }
    } else {
      this.state = {
        readyState: {
          error: null,
          props: {},
          retry: null
        }
      };
    }
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.query !== this.props.query ||
      nextProps.environment !== this.props.environment ||
      !areEqual(nextProps.variables, this.props.variables)
    ) {
      const {query, variables} = nextProps;
      const environment = nextProps.environment;
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
        if (nextProps.lookup && environment.check(operation.root)) {
          const snapshot = environment.lookup(operation.fragment);
          this.setState({
            readyState: {
              error: null,
              props: snapshot.data,
              retry: () => {
                this._fetch(operation, nextProps.cacheConfig);
              }
            }
          });
        } else {
          this._fetch(operation, nextProps.cacheConfig);
          this.setState({
            readyState: getDefaultState()
          });
        }
      } else {
        this._operation = null;
        this._relayContext = {
          environment,
          variables
        };
        this._release();
        this.setState({
          readyState: {
            error: null,
            props: {},
            retry: null
          }
        });
      }
    }
  }

  componentWillUnmount() {
    const {cacheConfig, query, variables, environment} = this.props;
    const {sub, ttl} = cacheConfig || {};
    const isCacheable = sub || ttl;
    if (isCacheable) {
      const pendingFetch = this._pendingFetch;
      const rootSubscription = this._rootSubscription;
      const selectionReference = this._selectionReference;
      const release = () => {
        pendingFetch && pendingFetch.dispose();
        rootSubscription && rootSubscription.dispose();
        selectionReference && selectionReference.dispose();
      };
      if (sub) {
        environment.gcSubs[sub] = release;
      } else if (ttl) {
        const exp = Date.now() + ttl;
        enviroment.gcTTL[exp] = release;
      }
    }
    this._release();
    this._mounted = false;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.render !== this.props.render ||
      nextState.readyState !== this.state.readyState
    );
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

    let readyState = getDefaultState();
    let snapshot; // results of the root fragment
    const onCompleted = () => {
      this._pendingFetch = null;
    };
    const onError = error => {
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

  getChildContext() {
    return {
      relay: this._relayContext
    };
  }

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

function getDefaultState() {
  return {
    error: null,
    props: null,
    retry: null
  };
}
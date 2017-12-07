/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import deepFreeze from 'deep-freeze';
import areEqual from 'fbjs/lib/areEqual';
import PropTypes from 'prop-types';
import React from 'react';
import Atmosphere from 'universal/Atmosphere';
import {MAX_INT} from 'universal/utils/constants';


// outside closure to support case when variables change. for pendingFetch, rootSubscription, selectionReference
const release = (...disposables) => () => {
  disposables.forEach((disposable) => {
    if (disposable) {
      disposable.dispose();
    }
  });
};

const isCacheable = (subs, cacheConfig = {}) => Boolean(subs || cacheConfig.force === false || cacheConfig.ttl);
const getDefaultState = () => ({
  error: null,
  props: null,
  retry: null,
  initialLoad: true
});
/**
 * @public
 *
 * Orchestrates fetching and rendering data for a single view or view hierarchy:
 * - Fetches the query/variables using the given network implementation.
 * - Normalizes the response(s) to that query, publishing them to the given
 *   store.
 * - Renders the pending/fail/success states with the provided render function.
 * - Subscribes for updates to the root data and re-renders with any changes.
 */
export default class QueryRenderer extends React.Component {
  static childContextTypes = {
    relay: PropTypes.object.isRequired
  };

  static propTypes = {
    cacheConfig: PropTypes.object,
    environment: PropTypes.object,
    query: PropTypes.func,
    render: PropTypes.func.isRequired,
    variables: PropTypes.object,
    subscriptions: PropTypes.arrayOf(PropTypes.func.isRequired),
    subParams: PropTypes.object
  };

  static timeouts = {};

  static renewTTL(queryKey) {
    clearTimeout(QueryRenderer.timeouts[queryKey]);
    delete QueryRenderer.timeouts[queryKey];
  }

  constructor(props, context) {
    super(props, context);
    const {cacheConfig, subscriptions} = props;
    this._pendingFetch = null;
    this._rootSubscription = null;
    this._selectionReference = null;
    this.unsubscribe = null;
    this._releaseOnUnmount = !isCacheable(subscriptions, cacheConfig);
    this._mounted = true;

    this.state = {
      readyState: this._fetchForProps(props)
    };
  }

  getChildContext() {
    return {
      relay: this._relayContext
    };
  }

  componentWillReceiveProps(nextProps) {
    const {environment, query, variables} = nextProps;
    if (query !== this.props.query || environment !== this.props.environment || !areEqual(variables, this.props.variables)) {
      // if variables changed, we want to hang on to the results of the old one just as if was an unmounted component
      this._requestRelease();
      this.setState({
        readyState: this._fetchForProps(nextProps)
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.render !== this.props.render || nextState.readyState !== this.state.readyState;
  }

  componentWillUnmount() {
    this._mounted = false;
    this._requestRelease();
  }

  _scheduleRelease(ttl, queryKey) {
    const {environment} = this.props;
    if (ttl !== undefined && ttl <= MAX_INT) {
      const {timeouts} = QueryRenderer;
      const releaseThunk = release(this._pendingFetch, this._rootSubscription, this._selectionReference);
      timeouts[queryKey] = setTimeout(() => {
        releaseThunk();
        environment.unregisterQuery(queryKey);
        delete timeouts[queryKey];
      }, ttl);
    }
  }

  _requestRelease() {
    const {cacheConfig = {}} = this.props;
    const {ttl} = cacheConfig;
    if (this._releaseOnUnmount) {
      this._release();
    } else {
      this._scheduleRelease(ttl, this._queryKey);
    }
  }

  releaseComponent = () => {
    if (this._mounted) {
      this._releaseOnUnmount = true;
    } else {
      this._release();
    }
  };

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

  _fetchForProps(props) {
    const {cacheConfig, environment, query, variables, subscriptions, subParams} = props;
    if (query) {
      const {
        createOperationSelector,
        getOperation
      } = environment.unstable_internal;
      const fullOperation = getOperation(query);
      const operation = createOperationSelector(fullOperation, variables);
      this._relayContext = {
        environment,
        variables: operation.variables
      };

      this._operationName = fullOperation.name;
      this._queryKey = Atmosphere.getKey(this._operationName, operation.variables);
      QueryRenderer.renewTTL(this._queryKey);

      // environment.check is expensive, do everything we can to prevent a call
      if (isCacheable(subscriptions, cacheConfig) && environment.check(operation.root)) {
        // data is available in the store, render without making any requests
        const snapshot = environment.lookup(operation.fragment);
        return {
          error: null,
          props: snapshot.data,
          retry: null,
          unsubscribe: this.unsubscribe,
          initialLoad: false
        };
      }
      if (subscriptions) {
        this._subscribe(subscriptions, {
          operationName: this._operationName,
          ...subParams
        });
      }

      return this._fetch(operation, props.cacheConfig) || getDefaultState();
    }
    this._relayContext = {
      environment,
      variables
    };
    this._release();
    return {
      error: null,
      props: {},
      retry: null,
      initialLoad: false
    };
  }

  _fetch(operation, cacheConfig) {
    const {environment} = this._relayContext;

    // Immediately retain the results of the new query to prevent relevant data
    // from being freed. This is not strictly required if all new data is
    // fetched in a single step, but is necessary if the network could attempt
    // to incrementally load data (ex: multiple query entries or incrementally
    // initialLoad records from disk cache).
    const nextReference = environment.retain(operation.root);

    let readyState = getDefaultState();
    let snapshot; // results of the root fragment
    let hasSyncResult = false;
    let hasFunctionReturned = false;

    if (this._pendingFetch) {
      this._pendingFetch.dispose();
    }
    if (this._rootSubscription) {
      this._rootSubscription.dispose();
    }

    const request = environment.execute({operation, cacheConfig}).finally(() => {
      this._pendingFetch = null;
    }).subscribe({
      next: () => {
        // `next` can be called multiple times by network layers that support
        // data subscriptions. Wait until the first payload to render `props`
        // and subscribe for data updates.
        if (snapshot) {
          return;
        }
        snapshot = environment.lookup(operation.fragment);
        readyState = {
          error: null,
          props: snapshot.data,
          retry: () => {
            // Do not reset the default state if refetching after success,
            // handling the case where _fetch may return syncronously instead
            // of calling setState.
            const syncReadyState = this._fetch(operation, cacheConfig);
            if (this._mounted && syncReadyState) {
              this.setState({readyState: syncReadyState});
            }
          },
          initialLoad: false
        };

        if (this._selectionReference) {
          this._selectionReference.dispose();
        }
        this._rootSubscription = environment.subscribe(snapshot, this._onChange);
        this._selectionReference = nextReference;
        // This line should be called only once.
        hasSyncResult = true;
        if (this._mounted && hasFunctionReturned) {
          this.setState({readyState});
        }
      },
      error: (error) => {
        readyState = {
          error,
          props: null,
          retry: () => {
            // Return to the default state when retrying after an error,
            // handling the case where _fetch may return syncronously instead
            // of calling setState.
            const syncReadyState = this._fetch(operation, cacheConfig);
            if (this._mounted) {
              const naiveReadyState = syncReadyState || getDefaultState();
              this.setState({
                readyState: {
                  ...naiveReadyState,
                  initialLoad: false
                }
              });
            }
          }
        };
        if (this._selectionReference) {
          this._selectionReference.dispose();
        }
        this._selectionReference = nextReference;
        hasSyncResult = true;
        if (this._mounted && hasFunctionReturned) {
          this.setState({readyState});
        }
      }
    });

    this._pendingFetch = {
      dispose() {
        request.unsubscribe();
        nextReference.dispose();
      }
    };
    hasFunctionReturned = true;
    return hasSyncResult ? readyState : null;
  }

  _onChange = (snapshot) => {
    if (this._mounted) {
      this.setState({
        readyState: {
          ...this.state.readyState,
          props: snapshot.data,
          initialLoad: false
        }
      });
    }
  }

  _subscribe(subscriptions, subParams) {
    const {environment, variables} = this._relayContext;
    environment.registerQuery(this._queryKey, subscriptions, subParams, variables, this.releaseComponent);
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

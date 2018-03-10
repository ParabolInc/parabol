/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */
/* eslint-disable */
import polyfill from 'react-lifecycles-compat';

const React = require('react');
const ReactRelayQueryFetcher = require('react-relay/lib/ReactRelayQueryFetcher');
const RelayPropTypes = require('react-relay/lib/RelayPropTypes');
const areEqual = require('fbjs/lib/areEqual');

import type {DataFrom} from 'react-relay/lib/ReactRelayQueryFetcher';
import type {
  CacheConfig,
  GraphQLTaggedNode,
  GraphQLSubscriptionConfig,
  IEnvironment,
  RelayContext,
  Snapshot,
  Variables,
} from 'relay-runtime';

type RetryCallbacks = {
  handleDataChange: ({
    error?: Error,
    snapshot?: Snapshot,
  }) => void,
  handleRetryAfterError: (error: Error) => void,
};

export type RenderProps = {
  error: ?Error,
  props: ?Object,
  retry: ?() => void,
};

type Subscription = (environment: IEnvironment, queryVariables: Variables, subParams?: Object) => GraphQLSubscriptionConfig;

export type Props = {
  cacheConfig?: ?CacheConfig,
  dataFrom?: DataFrom,
  environment: IEnvironment,
  query: ?GraphQLTaggedNode,
  render: (renderProps: RenderProps) => React.Node,
  subscriptions: Array<Subscription>,
  subParams?: Object,
  variables: Variables,
};

type State = {
  prevPropsEnvironment: IEnvironment,
  prevPropsVariables: Variables,
  prevQuery: ?GraphQLTaggedNode,
  queryFetcher: ReactRelayQueryFetcher,
  queryKey: string,
  relayContextEnvironment: IEnvironment,
  relayContextVariables: Variables,
  renderProps: RenderProps,
  retryCallbacks: RetryCallbacks,
};

const MAX_INT = 2147483647;
const makeQueryKey = (name, variables) => JSON.stringify({name, variables});
const isCacheable = (subs, cacheConfig: CacheConfig = {}) => Boolean(subs || cacheConfig.force === false || cacheConfig.ttl);

class SafeQueryFetcher extends ReactRelayQueryFetcher {
  readyToGC() {
    return this._readyToGC;
  }
  flagForGC() {
    this._readyToGC = true;
  }
}

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
class ReactRelayQueryRenderer extends React.Component<Props, State> {
  // TODO T25783053 Update this component to use the new React context API,
  // Once we have confirmed that it's okay to raise min React version to 16.3.
  static childContextTypes = {
    relay: RelayPropTypes.Relay,
  };

  _relayContext: RelayContext = {
    // $FlowFixMe TODO t16225453 QueryRenderer works with old+new environment.
    environment: (this.props.environment: IEnvironment),
    variables: this.props.variables,
  };

  constructor(props: Props, context: Object) {
    super(props, context);

    const handleDataChange = ({
      error,
      snapshot,
    }: {
      error?: Error,
      snapshot?: Snapshot,
    }): void => {
      this.setState({
        renderProps: getRenderProps(
          error,
          snapshot,
          queryFetcher,
          retryCallbacks,
        ),
      });
    };

    const handleRetryAfterError = (error: Error) =>
      this.setState({renderProps: getLoadingRenderProps()});

    const retryCallbacks = {
      handleDataChange,
      handleRetryAfterError,
    };

    const queryFetcher = new SafeQueryFetcher();
    if (!isCacheable(props.subscriptions, props.cacheConfig)) {
      queryFetcher.flagForGC();
    }

    this.state = {
      prevPropsEnvironment: props.environment,
      prevPropsVariables: props.variables,
      prevQuery: props.query,
      queryFetcher,
      retryCallbacks,
      ...fetchQueryAndComputeStateFromProps(
        props,
        queryFetcher,
        retryCallbacks,
      ),
    };
  }

  static timeouts = {};

  static renewTTL(queryKey: string) {
    clearTimeout(ReactRelayQueryRenderer.timeouts[queryKey]);
    delete ReactRelayQueryRenderer.timeouts[queryKey];
  }

  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State,
  ): $Shape<State> | null {
    if (
      prevState.prevQuery !== nextProps.query ||
      prevState.prevPropsEnvironment !== nextProps.environment ||
      !areEqual(prevState.prevPropsVariables, nextProps.variables)
    ) {
      return {
        prevQuery: nextProps.query,
        prevPropsEnvironment: nextProps.environment,
        prevPropsVariables: nextProps.variables,
        ...fetchQueryAndComputeStateFromProps(
          nextProps,
          prevState.queryFetcher,
          prevState.retryCallbacks,
        ),
      };
    }

    return null;
  }

  componentWillUnmount(): void {
    this._requestRelease();
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return (
      nextProps.render !== this.props.render ||
      nextState.renderProps !== this.state.renderProps
    );
  }

  getChildContext(): Object {
    return {
      relay: this._relayContext,
    };
  }

  _requestRelease(): void {
    const {environment, cacheConfig} = this.props;
    const {ttl} = cacheConfig || {};
    const {queryKey, queryFetcher} = this.state;
    if (queryFetcher.readyToGC()) {
      environment.unregisterQuery(queryKey);
      queryFetcher.dispose();
    } else {
      this._scheduleRelease(ttl, queryKey);
    }
  }

  _scheduleRelease(ttl?: number, queryKey: string): void {
    if (ttl !== undefined && ttl <= MAX_INT) {
      const {timeouts} = ReactRelayQueryRenderer;
      timeouts[queryKey] = setTimeout(() => {
        const {relayContextEnvironment, queryFetcher} = this.state;
        queryFetcher.dispose();
        relayContextEnvironment.unregisterQuery(queryKey);
        delete timeouts[queryKey];
      }, ttl);
    }
  }

  render() {
    const {
      relayContextEnvironment,
      relayContextVariables,
      renderProps,
    } = this.state;

    // HACK Mutate the context.relay object before updating children,
    // To account for any changes made by static gDSFP.
    // Updating this value in gDSFP would be less safe, since props changes
    // could be interrupted and we might re-render based on a setState call.
    // Child containers rely on context.relay being mutated (also for gDSFP).
    // $FlowFixMe TODO t16225453 QueryRenderer works with old+new environment.
    this._relayContext.environment = (relayContextEnvironment: IEnvironment);
    this._relayContext.variables = relayContextVariables;
    return this.props.render(renderProps);
  }
}

function getLoadingRenderProps(): RenderProps {
  return {
    error: null,
    props: null, // `props: null` indicates that the data is being fetched (i.e. loading)
    retry: null,
  };
}

function getEmptyRenderProps(): RenderProps {
  return {
    error: null,
    props: {}, // `props: {}` indicates no data available
    retry: null,
  };
}

function getRenderProps(
  error: ?Error,
  snapshot: ?Snapshot,
  queryFetcher: ReactRelayQueryFetcher,
  retryCallbacks: RetryCallbacks,
): RenderProps {
  return {
    error: error ? error : null,
    props: snapshot ? snapshot.data : null,
    retry: () => {
      const syncSnapshot = queryFetcher.retry();
      if (syncSnapshot) {
        retryCallbacks.handleDataChange({snapshot: syncSnapshot});
      } else if (error) {
        // If retrying after an error and no synchronous result available,
        // reset the render props
        retryCallbacks.handleRetryAfterError(error);
      }
    },
  };
}

function fetchQueryAndComputeStateFromProps(
  props: Props,
  queryFetcher: ReactRelayQueryFetcher,
  retryCallbacks: RetryCallbacks,
): $Shape<State> {
  const {environment, query, variables} = props;
  if (query) {
    // $FlowFixMe TODO t16225453 QueryRenderer works with old+new environment.
    const genericEnvironment = (environment: IEnvironment);

    const {
      createOperationSelector,
      getRequest,
    } = genericEnvironment.unstable_internal;
    const request = getRequest(query);
    const operation = createOperationSelector(request, variables);
    const queryKey = makeQueryKey(request.name, operation.variables);
    ReactRelayQueryRenderer.renewTTL(queryKey);
    if (props.subscriptions) {
      environment.registerQuery(queryKey, props.subscriptions, props.subParams, operation.variables, queryFetcher);
    }

    try {
      const snapshot = queryFetcher.fetch({
        cacheConfig: props.cacheConfig,
        dataFrom: props.dataFrom,
        environment: genericEnvironment,
        onDataChange: retryCallbacks.handleDataChange,
        operation,
      });
      if (!snapshot) {
        return {
          queryKey,
          relayContextEnvironment: environment,
          relayContextVariables: operation.variables,
          renderProps: getLoadingRenderProps(),
        };
      }

      return {
        queryKey,
        relayContextEnvironment: environment,
        relayContextVariables: operation.variables,
        renderProps: getRenderProps(
          null,
          snapshot,
          queryFetcher,
          retryCallbacks,
        ),
      };
    } catch (error) {
      return {
        queryKey,
        relayContextEnvironment: environment,
        relayContextVariables: operation.variables,
        renderProps: getRenderProps(error, null, queryFetcher, retryCallbacks),
      };
    }
  } else {
    queryFetcher.dispose();

    return {
      relayContextEnvironment: environment,
      relayContextVariables: variables,
      renderProps: getEmptyRenderProps(),
    };
  }
}

polyfill(ReactRelayQueryRenderer);
module.exports = ReactRelayQueryRenderer;

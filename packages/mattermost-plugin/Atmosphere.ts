import {Variables} from "react-relay";
import {
  RecordSource,
  RequestParameters,
  RelayFieldLogger,
  Environment,
  Network,
  Observable,
} from "relay-runtime"
import RelayModernStore from "relay-runtime/lib/store/RelayModernStore";

import {Client4} from "mattermost-redux/client";
//;(RelayFeatureFlags as any).ENABLE_RELAY_CONTAINERS_SUSPENSE = false
//;(RelayFeatureFlags as any).ENABLE_RELAY_RESOLVERS = false

type State = {
  authToken: string | null
  serverUrl: string
}

const fetchFunction = (state: State) => (params: RequestParameters, variables: Variables) => {
  const {serverUrl, authToken} = state
  console.log('GEORG fetchFunction', serverUrl, authToken, params, variables)
  const response = fetch(serverUrl, Client4.getOptions({
    method: "POST",
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-application-authorization': authToken ? `Bearer ${authToken}` : '',
      //'x-correlation-id': connectionId || '',
    },
    body: JSON.stringify({
      type: "start",
      payload: {
        query: params.text,
        variables,
      }
    }),
  }));

  return Observable.from(response.then(async (data) => {
    const json = await data.json()
    return json.payload
   }));
};

const relayFieldLogger: RelayFieldLogger = (event) => {
  if(event.kind === "relay_resolver.error") {
    console.warn(`Resolver error encountered in ${event.owner}.${event.fieldPath}`)
    console.warn(event.error)
  }
}

export class Atmosphere extends Environment {
  state: State

  constructor(serverUrl: string) {
    const state = {
      serverUrl: serverUrl + '/graphql',
      authToken: null
    }
    const network = Network.create(fetchFunction(state));
    const store = new RelayModernStore(new RecordSource(), {
      resolverContext: {
        serverUrl,
      }
    });
    super({
      store,
      network,
      relayFieldLogger
    });
    this.state = state
  }
}

/**
 * Creates a new Relay environment instance for managing (fetching, storing) GraphQL data.
 */
export function createEnvironment(serverUrl: string) {
  return new Atmosphere(serverUrl)
}


export function getGraphQLHost() {
  if (process && process.env && process.env.GRAPHQL_HOST) {
    return process.env.GRAPHQL_HOST;
  } else if (typeof window !== 'undefined') {
    return window && window.location && window.location.host || 'localhost:3000';
  }
  return 'localhost:3000';
}

export function getGraphQLProtocol() {
  if (process && process.env && process.env.GRAPHQL_PROTOCOL) {
    return process.env.GRAPHQL_PROTOCOL;
  } else if (typeof window !== 'undefined') {
    return window && window.location && window.location.protocol || 'http:';
  }
  return 'http:';
}

export function getGraphQLPath() {
  // TODO: one day, make this configurable?
  return 'graphql';
}

export function getGraphQLUri() {
  return `${getGraphQLProtocol()}//${getGraphQLHost()}/${getGraphQLPath()}`;
}

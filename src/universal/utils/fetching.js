import fetch from 'isomorphic-fetch';
import {localStorageVars} from './clientOptions';
import {
  getGraphQLHost,
  getGraphQLProtocol,
  getGraphQLUri
} from './graphQLConfig';

export function parseJSON(response) {
  return response.json();
}

export function hostUrl() {
  const host = getGraphQLHost();
  const protocol = getGraphQLProtocol();
  return `${protocol}//${host}`;
}

export function postJSON(route, obj) {
  return fetch(hostUrl() + route, {
    method: 'post',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj)
  });
}

export function getJSON(route) {
  return fetch(hostUrl() + route);
}

// export function pick(o, ...fields) {
//  return Object.assign({}, ...(for (p of fields) {[p]: o[p]}));
// }

export const getClientError = errors => {
  if (!errors) {
    return undefined;
  }
  const error = errors[0].message;
  return (error.indexOf('{"_error"') === -1) ? {_error: 'Server query error'} : JSON.parse(error);
};

export const prepareGraphQLParams = graphParams => {
  // compress
  const params = graphParams;
  params.query = params.query.replace(/\s/g, '');
  return JSON.stringify(params);
};

export const fetchGraphQL = async graphParams => {
  const serializedParams = prepareGraphQLParams(graphParams);
  const authToken = localStorage.getItem(localStorageVars.authTokenName);
  const res = await fetch(getGraphQLUri(), {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: serializedParams
  });
  const resJSON = await res.json();
  const {data, errors} = resJSON;
  return {data, error: getClientError(errors)};
};

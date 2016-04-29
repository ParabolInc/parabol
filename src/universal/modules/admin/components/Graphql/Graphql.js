import React from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import {localStorageVars} from 'universal/utils/clientOptions';
import 'universal/styles/global/graphiql.css';
import {getGraphQLHost, getGraphQLProtocol} from 'universal/utils/graphQLConfig';

const graphQLHost = getGraphQLHost();
const graphQLProtocol = getGraphQLProtocol();

const graphQLFetcher = async ({query, variableParams}) => {
  if (!__CLIENT__) {
    return undefined;
  }
  const authToken = localStorage.getItem(localStorageVars.authTokenName);
  const variables = variableParams ? JSON.parse(variableParams) : undefined;
  const res = await fetch(`${graphQLProtocol}//${graphQLHost}/graphql`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({query, variables})
  });
  return res.json();
};

export default function Graphiql() {
  return (
    <GraphiQL fetcher={graphQLFetcher} />
  );
}

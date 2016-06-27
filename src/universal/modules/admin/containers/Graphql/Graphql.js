import './addCSS';
import React, {Component, PropTypes} from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import {getGraphQLHost, getGraphQLProtocol} from 'universal/utils/graphQLConfig';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import requireAuthAndRole from 'universal/decorators/requireAuthAndRole/requireAuthAndRole';

const graphQLHost = getGraphQLHost();
const graphQLProtocol = getGraphQLProtocol();

const makeGraphQLFetcher = authToken => {
  return async(graphQLParams) => {
    if (!__CLIENT__) {
      return undefined;
    }
    const variables = graphQLParams.variables ?
      JSON.parse(graphQLParams.variables) : undefined;
    const res = await fetch(`${graphQLProtocol}//${graphQLHost}/graphql`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({query: graphQLParams.query, variables})
    });
    return res.json();
  };
};

const queryString = `
query {
  cachedUserAndToken: getUserWithAuthToken(authToken: $authToken) {
    authToken
  }
}`;

const mutationHandlers = {
  updateUserWithAuthToken(optimisticVariables, queryResponse, currentResponse) {
    if (queryResponse) {
      currentResponse.cachedUserAndToken = queryResponse;
      return currentResponse;
    }
    return undefined;
  }
};

const cashayOptions = {
  component: 'Graphql',
  variables: {
    authToken: response => response.cachedUserAndToken.authToken
  },
  mutationHandlers
};

const mapStateToProps = () => {
  return {
    response: cashay.query(queryString, cashayOptions)
  };
};

@connect(mapStateToProps)
@requireAuthAndRole('su')
// eslint-disable-next-line react/prefer-stateless-function
export default class Graphiql extends Component {
  static propTypes = {
    response: PropTypes.shape({
      data: PropTypes.shape({
        cachedUserAndToken: PropTypes.shape({
          authToken: PropTypes.string
        })
      })
    })
  }

  render() {
    const {response} = this.props;
    const {authToken} = response.data.cachedUserAndToken;
    const graphQLFetcher = makeGraphQLFetcher(authToken);
    return (
      <GraphiQL fetcher={graphQLFetcher}/>
    );
  }
}

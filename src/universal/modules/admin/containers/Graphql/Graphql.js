import './addCSS';
import React, {Component, PropTypes} from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import {getGraphQLHost, getGraphQLProtocol} from 'universal/utils/graphQLConfig';
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

const mapStateToProps = state => {
  return {
    authToken: state.authToken
  };
};

@connect(mapStateToProps)
@requireAuthAndRole('su')
// eslint-disable-next-line react/prefer-stateless-function
export default class Graphiql extends Component {
  static propTypes = {
    authToken: PropTypes.string
  };

  render() {
    const {authToken} = this.props;
    const graphQLFetcher = makeGraphQLFetcher(authToken);
    return (
      <GraphiQL fetcher={graphQLFetcher}/>
    );
  }
}

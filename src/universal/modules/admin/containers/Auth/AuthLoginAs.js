import React from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import Helmet from 'react-helmet';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const imposterTokenQuery = `
query {
  user @cached(type: "User") {
    id,
    jwt
  }
}`;

async function createImposterToken(code) {
  // cashay.create({httpTransport: new ActionHTTPTransport()});
  const options = {variables: {code}};
  await cashay.mutate('createImposterToken', options);
}

const mutationHandlers = {
  createImposterToken(optimisticVariables, queryResponse, currentResponse) {
    if (queryResponse) {
      Object.assign(currentResponse.user, queryResponse);
    }
    return currentResponse;
  },
};

const mapStateToProps = (state, props) => {
  const {location: {query: {code}}} = props;
  const userId = state.auth.obj.sub;
  const {user} = cashay.query(imposterTokenQuery, {
    op: 'authLoginAs',
    resolveCached: {user: () => userId},
    mutationHandlers
  }).data;
  return {
    code,
    imposterToken: user.jwt
  };
};

const showDucks = () => {
  return (
    <div>
      <Helmet title="Authenticating As..."/>
      <LoadingView />
    </div>
  );
};

const AuthLoginAsContainer = (props) => {
  const {code} = props;
  if (!__CLIENT__) {
    return showDucks();
  }
  if (code) {
    createImposterToken(code);
    return showDucks();
  }
  return (
    <div>
      No code provided!
    </div>
  )
};

export default connect(mapStateToProps)(AuthLoginAsContainer);

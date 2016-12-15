import React from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import Helmet from 'react-helmet';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';

async function createImposterToken(code) {
  cashay.create({httpTransport: new ActionHTTPTransport()});
  const options = {variables: {code}};
  await cashay.mutate('createImposterToken', options);
}

const createImposterTokenMutation = {
  createImposterToken: `
  mutation {
    createImposterToken(code: $code) {
      id
      jwt
    }
  }
  `
};

const createImposterTokenMutationHandler = {
  createImposterToken(optimisticVariables, queryResponse, currentResponse) {
    if (optimisticVariables) {
      Object.assign(currentResponse.user, optimisticVariables.updatedProfile);
    } else if (queryResponse) {
      Object.assign(currentResponse.user, queryResponse);
    }
    return currentResponse;
  },
};

const mapStateToProps = (state, props) => {
  const {location: {query}} = props;
  const auth = state.auth.obj;
  const authedOptions = getAuthedOptions(auth.sub);
  Object.assign(authedOptions.customMutations, createImposterTokenMutation);
  Object.assign(authedOptions.mutationHandlers, createImposterTokenMutationHandler);
  console.log(authedOptions);
  return {
    code: query.code,
    user: cashay.query(getAuthQueryString, authedOptions)
  };
};

const showDucks = () => {
  return (
    <div>
      <Helmet title="Authenticating As..." />
      <LoadingView />
    </div>
  );
};

const AuthLoginAsContainer = (props) => {
  const {code} = props;
  if (!__CLIENT__) {
    return showDucks();
  }
  createImposterToken(code);
  return showDucks();
};

export default connect(mapStateToProps)(AuthLoginAsContainer);

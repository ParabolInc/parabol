import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import Helmet from 'react-helmet';
import {withRouter} from 'react-router';
import requireAuthAndRole from 'universal/decorators/requireAuthAndRole/requireAuthAndRole';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {showError} from 'universal/modules/toast/ducks/toastDuck';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
import signout from 'universal/containers/Signout/signout';
import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken';


const impersonateTokenQuery = `
query {
  user @cached(type: "User") {
    email
    id,
    jwt,
    name,
    picture
  }
}`;

function createImposter(userId, dispatch, router) {
  const variables = {userId};
  cashay.mutate('createImposterToken', {variables}).then(async ({data, error}) => {
    if (error) {
      // eslint-disable-next-line no-underscore-dangle
      dispatch(showError({ title: 'Whoa there!', message: error._error }));
      return;
    }
    const {email, id, jwt, name, picture} = data.createImposterToken;
    const profile = {avatar: picture, email, id, name};
    // Reset application state:
    await signout(dispatch);
    // Cashay User query needed to setup later mutation in signinAndUpdateToken:
    cashay.query(getAuthQueryString, getAuthedOptions(id));
    // Assume the identity of the new user:
    await signinAndUpdateToken(dispatch, profile, jwt);
    // Navigate to a default location, the application root:
    router.replace('/');
  });
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
  const {params: {newUserId}} = props;
  const userId = state.auth.obj.sub;
  const {user} = cashay.query(impersonateTokenQuery, {
    op: 'impersonate',
    resolveCached: {user: () => userId},
    mutationHandlers
  }).data;
  return {
    newUserId,
    user
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

@connect(mapStateToProps)
@withRouter
@requireAuthAndRole('su', {silent: true})
export default class Impersonate extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    newUserId: PropTypes.string,
    router: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {dispatch, newUserId, router} = this.props;

    if (!newUserId) {
      return;
    }
    createImposter(newUserId, dispatch, router);
  }

  render() {
    const {newUserId} = this.props;
    if (!__CLIENT__) {
      return showDucks();
    }
    if (!newUserId) {
      return (
        <div>
          No newUserId provided!
        </div>
      );
    }
    return showDucks();
  }
}

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import Auth0ShowLock from 'universal/components/Auth0ShowLock/Auth0ShowLock';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {setWelcomeActivity} from 'universal/modules/userDashboard/ducks/settingsDuck';
import {withRouter} from 'react-router';
import {
  showError,
  showSuccess,
  showWarning
} from 'universal/modules/notifications/ducks/notifications';

import {
  invalidInvitation,
  inviteNotFound,
  teamAlreadyJoined,
  successfulJoin
} from 'universal/modules/invitation/helpers/notifications';

const getUserWithMemberships = `
query {
  user: getCurrentUser {
    email,
    id,
    isNew,
    picture,
    preferredName
    memberships {
      id,
      team {
        id,
        name
      },
      isLead,
      isActive,
      isFacilitator
    }
  }
}`;

const mutationHandlers = {
  acceptInvitation(optimisticVariables, queryResponse, currentResponse) {
    if (queryResponse) {
      // we can't be optimistic, server must process our invite token:
      currentResponse.user.memberships.push(queryResponse);
    }
    return undefined;
  },
  updateUserWithAuthToken(optimisticVariables, queryResponse, currentResponse) {
    if (queryResponse) {
      currentResponse.user = {
        ...currentResponse.user,
        ...queryResponse
      };
      return currentResponse;
    }
    return undefined;
  }
};

const cashayOptions = {
  component: 'invitation',
  mutationHandlers,
  localOnly: true
};

const mapStateToProps = (state, props) => {
  const {params: {id}} = props;
  return {
    authToken: state.authToken,
    inviteToken: id,
    user: cashay.query(getUserWithMemberships, cashayOptions).data.user,
  };
};

@connect(mapStateToProps)
@withRouter
export default class Invitation extends Component {
  static propTypes = {
    authToken: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    inviteToken: PropTypes.string.isRequired,
    router: PropTypes.object.isRequired,
    user: PropTypes.object,
    withRouter: PropTypes.object
  };

  componentDidMount() {
    this.stateMachine(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.stateMachine(nextProps);
  }

  stateMachine = (props) => {
    const {authToken, user, router} = props;

    if (authToken) {
      if (user && user.isNew === false) {
        // If user already has an account, let them accept the new team via the UI:
        router.push('/me');
      } else if (user && user.isNew === true) {
        // If the user is new let's process their invite:
        this.processInvitation();
      }
    }
  };

  processInvitation = () => {
    const {dispatch, inviteToken, router} = this.props;
    const options = {
      variables: {
        inviteToken
      }
    };
    cashay.mutate('acceptInvitation', options)
      .then(({data, error}) => {
        if (error) {
          if (error.subtype === 'alreadyJoined') {
            /*
             * This should be *very* difficult to have occur:
             */
            dispatch(showError(teamAlreadyJoined));
            router.push('/settings/me');
            return;
          } else if (error.subtype === 'invalidToken') {
            dispatch(showError(invalidInvitation));
          } else if (error.subtype === 'notFound') {
            dispatch(showWarning(inviteNotFound));
          } else {
            console.warn('unable to accept invitation:');
            console.warn(error);
          }
          // TODO: pop them a toast and tell them what happened?
          router.push('/welcome');
        } else if (data) {
          const {id} = data.acceptInvitation.team;
          dispatch(setWelcomeActivity(`/team/${id}`));
          dispatch(showSuccess(successfulJoin));
          router.push('/me/settings');
        }
      })
      .catch(console.warn.bind(console));
  };

  renderLogin = () => (
    <div>
      <LoadingView />
      <Auth0ShowLock {...this.props} />
    </div>
  );

  render() {
    const {authToken} = this.props;

    if (!authToken) {
      // Authenticate the user, then let's find out what else to do:
      return this.renderLogin();
    }

    // TODO this would be a nice place for a spinner:
    return (<div/>);
  }
}

import jwtDecode from 'jwt-decode';
import {commitMutation} from 'react-relay';
import {
  invalidInvitation,
  inviteExpired,
  inviteNotFound,
  successfulExistingJoin,
  successfulJoin,
  teamAlreadyJoined
} from 'universal/modules/invitation/helpers/notifications';
import {showError, showSuccess, showWarning} from 'universal/modules/toast/ducks/toastDuck';
import {setWelcomeActivity} from 'universal/modules/userDashboard/ducks/settingsDuck';
import {setAuthToken} from 'universal/redux/authDuck';

const mutation = graphql`
  mutation AcceptTeamInviteEmailMutation($inviteToken: ID!) {
    acceptTeamInviteEmail(inviteToken: $inviteToken) {
      authToken
      teamName
      teamId
    }
  }
`;

const AcceptTeamInviteEmailMutation = (environment, inviteToken, dispatch, history) => {
  // const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {inviteToken},
    updater: (store) => {
      const payload = store.getRootField('acceptTeamInviteEmail');
      const authToken = payload.getValue('authToken');
      const teamId = payload.getValue('teamId');
      const {tms} = jwtDecode(authToken);
      dispatch(setAuthToken(authToken));
      if (tms.length <= 1) {
        dispatch(showSuccess(successfulJoin));
        dispatch(setWelcomeActivity(`/team/${teamId}`));
        history.push('/me/settings');
      } else {
        dispatch(showSuccess(successfulExistingJoin));
        history.push(`/team/${teamId}`);
      }
    },
    // optimisticUpdater: (store) => {
    // TODO add the team to the sidebar when we move teams to relay
    // },
    //onCompleted,
    onError: (error) => {
      const {_error: errorType} = error || {};
      if (errorType === 'alreadyJoined') {
        dispatch(showError(teamAlreadyJoined));
        history.push('/me/settings');
      } else if (errorType === 'invalidToken') {
        dispatch(showError(invalidInvitation));
      } else if (errorType === 'notFound') {
        dispatch(showWarning(inviteNotFound));
      } else if (errorType === 'expiredInvitation') {
        dispatch(showWarning(inviteExpired));
      } else {
        console.warn('unable to accept invitation:');
        console.warn(error);
      }
    }
  });
};

export default AcceptTeamInviteEmailMutation;

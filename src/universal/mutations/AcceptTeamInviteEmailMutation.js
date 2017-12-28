import jwtDecode from 'jwt-decode';
import {commitMutation} from 'react-relay';
import {
  invalidInvitation, inviteExpired, inviteNotFound, successfulExistingJoin, successfulJoin,
  teamAlreadyJoined
} from 'universal/modules/invitation/helpers/notifications';
import {showError, showSuccess, showWarning} from 'universal/modules/toast/ducks/toastDuck';
import {setWelcomeActivity} from 'universal/modules/userDashboard/ducks/settingsDuck';
import {handleAddTeamToViewerTeams} from 'universal/mutations/AddTeamMutation';
import {setAuthToken} from 'universal/redux/authDuck';

const mutation = graphql`
  mutation AcceptTeamInviteEmailMutation($inviteToken: ID!) {
    acceptTeamInviteEmail(inviteToken: $inviteToken) {
      team {
        # No way to use fragments in mutations without borked onCompleted. 
        # See https://github.com/facebook/relay/issues/2250
        id
        isPaid
        name
      }
      authToken
    }
  }
`;

const AcceptTeamInviteEmailMutation = (environment, inviteToken, dispatch, history) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {inviteToken},
    updater: (store) => {
      const team = store.getRootField('acceptTeamInviteEmail').getLinkedRecord('team');
      handleAddTeamToViewerTeams(store, viewerId, team);
    },
    onCompleted: (data) => {
      const {acceptTeamInviteEmail: {team: {id: teamId}, authToken}} = data;
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

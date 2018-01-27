import jwtDecode from 'jwt-decode';
import {commitMutation} from 'react-relay';
import {setWelcomeActivity} from 'universal/modules/userDashboard/ducks/settingsDuck';
import {acceptTeamInviteTeamUpdater} from 'universal/mutations/AcceptTeamInviteMutation';
import handleToastError from 'universal/mutations/handlers/handleToastError';
import {setAuthToken} from 'universal/redux/authDuck';

// Must fragment on concrete types due to relay bug
graphql`
  fragment AcceptTeamInviteEmailMutation_teamMember on AcceptTeamInviteEmailPayload {
    teamMember {
      ...CompleteTeamMemberFrag @relay(mask: false)
    }
    team {
      name
    }
    removedSoftTeamMember {
      id
      teamId
    }
  }
`;

graphql`
  fragment AcceptTeamInviteEmailMutation_invitation on AcceptTeamInviteEmailPayload {
    removedInvitation {
      id
    }
  }
`;

graphql`
  fragment AcceptTeamInviteEmailMutation_project on AcceptTeamInviteEmailPayload {
    hardenedProjects {
      ...CompleteProjectFrag @relay(mask: false)
    }
  }
`;

graphql`
  fragment AcceptTeamInviteEmailMutation_team on AcceptTeamInviteEmailPayload {
    team {
      ...CompleteTeamFrag @relay(mask: false)
    }
    authToken
    removedNotification {
      id
    }
    error {
      title
      message
    }
    user {
      ...UserAnalyticsFrag @relay(mask: false)
    }

  }
`;

const mutation = graphql`
  mutation AcceptTeamInviteEmailMutation($inviteToken: ID!) {
    acceptTeamInviteEmail(inviteToken: $inviteToken) {
      ...AcceptTeamInviteEmailMutation_team @relay(mask: false)
    }
  }
`;

export const acceptTeamInviteEmailTeamUpdater = (payload, store, viewerId, dispatch) => {
  const error = payload.getLinkedRecord('error');
  handleToastError(error, dispatch);
  acceptTeamInviteTeamUpdater(payload, store, viewerId, dispatch);
};

const AcceptTeamInviteEmailMutation = (environment, inviteToken, dispatch, history, onError) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {inviteToken},
    updater: (store) => {
      const payload = store.getRootField('acceptTeamInviteEmail');
      acceptTeamInviteEmailTeamUpdater(payload, store, viewerId, dispatch);
    },
    onError,
    onCompleted: (data) => {
      const {acceptTeamInviteEmail: {error, team, authToken, user}} = data;
      if (error) {
        history.push('/signout');
      } else {
        const {id: teamId} = team;
        const {tms} = jwtDecode(authToken);
        dispatch(setAuthToken(authToken, user));
        if (tms.length <= 1) {
          dispatch(setWelcomeActivity(`/team/${teamId}`));
          history.push('/me/settings');
        } else {
          history.push(`/team/${teamId}`);
        }
      }
    }
  });
};

export default AcceptTeamInviteEmailMutation;

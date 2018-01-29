import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import handleAddTeamMembers from 'universal/mutations/handlers/handleAddTeamMembers';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';
import handleRemoveInvitations from 'universal/mutations/handlers/handleRemoveInvitations';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import getInProxy from 'universal/utils/relay/getInProxy';
import handleRemoveSoftTeamMembers from 'universal/mutations/handlers/handleRemoveSoftTeamMembers';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';

graphql`
  fragment AcceptTeamInviteMutation_invitation on AcceptTeamInviteNotificationPayload {
    removedInvitation {
      id
      teamId
    } 
  }
`;

graphql`
  fragment AcceptTeamInviteMutation_teamMember on AcceptTeamInviteNotificationPayload {
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
  fragment AcceptTeamInviteMutation_project on AcceptTeamInviteNotificationPayload {
    hardenedProjects {
      ...CompleteProjectFrag @relay(mask: false)
    }
  }
`;

graphql`
  fragment AcceptTeamInviteMutation_team on AcceptTeamInviteNotificationPayload {
    team {
      ...CompleteTeamFrag @relay(mask: false)
    }
    removedNotification {
      id
    }
  }
`;

const mutation = graphql`
  mutation AcceptTeamInviteMutation($notificationId: ID!) {
    acceptTeamInviteNotification(notificationId: $notificationId) {
      ...AcceptTeamInviteMutation_team @relay(mask: false)
    }
  }
`;

const popWelcomeToast = (team, dispatch) => {
  if (!team) return;
  const teamName = team.getValue('name');
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'Congratulations!',
    message: `You’ve been added to team ${teamName}`,
    action: {label: 'Great!'}
  }));
};

const popJoinedYourTeamToast = (payload, dispatch) => {
  const teamName = getInProxy(payload, 'team', 'name');
  const preferredName = getInProxy(payload, 'teamMember', 'preferredName');
  if (!preferredName) return;
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'Ahoy, a new crewmate!',
    message: `${preferredName} just joined team ${teamName}`
  }));
};

export const acceptTeamInviteTeamUpdater = (payload, store, viewerId, dispatch) => {
  const team = payload.getLinkedRecord('team');
  handleAddTeams(team, store, viewerId);

  const notificationId = getInProxy(payload, 'removedNotification', 'id');
  handleRemoveNotifications(notificationId, store, viewerId);

  popWelcomeToast(team, dispatch);
};

export const acceptTeamInviteTeamMemberUpdater = (payload, store, viewerId, dispatch) => {
  const teamMember = payload.getLinkedRecord('teamMember');
  handleAddTeamMembers(teamMember, store);

  const removedSoftTeamMember = payload.getLinkedRecord('removedSoftTeamMember');
  handleRemoveSoftTeamMembers(removedSoftTeamMember, store);

  popJoinedYourTeamToast(payload, dispatch);
};

export const acceptTeamInviteProjectUpdater = (payload, store, viewerId) => {
  const hardenedProjects = store.getLinkedRecords(payload, 'hardenedProjects');
  handleUpsertProjects(hardenedProjects, store, viewerId);
};

export const acceptTeamInviteInvitationUpdater = (payload, store) => {
  const invitation = payload.getLinkedRecord('removedInvitation');
  handleRemoveInvitations(invitation, store);
};

const AcceptTeamInviteMutation = (environment, notificationId, dispatch, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {notificationId},
    updater: (store) => {
      const payload = store.getRootField('acceptTeamInviteNotification');
      acceptTeamInviteTeamUpdater(payload, store, viewerId, dispatch);
    },
    onCompleted,
    onError
  });
};

export default AcceptTeamInviteMutation;

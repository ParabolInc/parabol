import {commitMutation} from 'react-relay';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';
import popTeamInviteNotificationToast from 'universal/mutations/toasts/popTeamInviteNotificationToast';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment AddTeamMutation_team on AddTeamCreatorPayload {
    team {
      ...CompleteTeamFragWithMembers @relay(mask: false)
    }
  }
`;

graphql`
  fragment AddTeamMutation_notification on AddTeamInviteePayload {
    teamInviteNotification {
      type
      ...TeamInvite_notification @relay(mask: false)
    }
  }
`;

const mutation = graphql`
  mutation AddTeamMutation($newTeam: NewTeamInput!, $invitees: [Invitee!]) {
    addTeam(newTeam: $newTeam, invitees: $invitees) {
      ...AddTeamMutation_team @relay(mask: false)
    }
  }
`;

const popTeamCreatedToast = (payload, {dispatch, history}) => {
  const teamId = getInProxy(payload, 'team', 'id');
  const teamName = getInProxy(payload, 'team', 'name');
  dispatch(showSuccess({
    title: 'Team successfully created!',
    message: `Here's your new team dashboard for ${teamName}`
  }));
  history.push(`/team/${teamId}`);
};

export const addTeamTeamUpdater = (payload, store, viewerId, options) => {
  const team = payload.getLinkedRecord('team');
  handleAddTeams(team, store, viewerId);
  popTeamCreatedToast(payload, options);
};

export const addTeamMutationNotificationUpdater = (payload, store, viewerId, options) => {
  const notification = payload.getLinkedRecord('teamInviteNotification');
  handleAddNotifications(notification, store, viewerId);
  popTeamInviteNotificationToast(notification, options);
};

const AddTeamMutation = (environment, variables, options, onCompleted, onError) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addTeam');
      addTeamTeamUpdater(payload, store, viewerId, options);
    },
    optimisticUpdater: (store) => {
      const {newTeam} = variables;
      const team = createProxyRecord(store, 'Team', {...newTeam, isPaid: true});
      handleAddTeams(team, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default AddTeamMutation;

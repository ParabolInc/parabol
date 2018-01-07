import {commitMutation} from 'react-relay';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleAddOrganization from 'universal/mutations/handlers/handleAddOrganization';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';
import popTeamInviteNotificationToast from 'universal/mutations/toasts/popTeamInviteNotificationToast';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment AddOrgMutation_organization on AddOrgPayload {
    organization {
      id
      name
      orgUserCount {
        activeUserCount
        inactiveUserCount
      }
      picture
      tier
    }
    team {
      ...CompleteTeamFragWithMembers @relay(mask: false)
    }
  }
`;

graphql`
  fragment AddOrgMutation_notification on AddOrgPayload {
    teamInviteNotification {
      type
      ...TeamInvite_notification @relay(mask: false)
    }
  }
`;

const mutation = graphql`
  mutation AddOrgMutation($newTeam: NewTeamInput!, $invitees: [Invitee!], $orgName: String!) {
    addOrg(newTeam: $newTeam, invitees: $invitees, orgName: $orgName) {
      ...AddOrgMutation_organization @relay(mask: false)
    }
  }
`;

const popOrganizationCreatedToast = (payload, {dispatch, history}) => {
  const teamId = getInProxy(payload, 'team', 'id');
  if (!teamId) return;
  const teamName = getInProxy(payload, 'team', 'name');
  dispatch(showSuccess({
    title: 'Organization successfully created!',
    message: `Here's your new team dashboard for ${teamName}`
  }));
  history.push(`/team/${teamId}`);
};

export const addOrgMutationOrganizationUpdater = (payload, store, viewerId, options) => {
  const organization = payload.getLinkedRecord('organization');
  handleAddOrganization(organization, store, viewerId);

  const team = payload.getLinkedRecord('team');
  handleAddTeams(team, store, viewerId);
  popOrganizationCreatedToast(payload, options);
};

export const addOrgMutationNotificationUpdater = (payload, store, viewerId, options) => {
  const notification = payload.getLinkedRecord('teamInviteNotification');
  handleAddNotifications(notification, store, viewerId);
  popTeamInviteNotificationToast(notification, options);
};

const AddOrgMutation = (environment, variables, options, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addOrg');
      addOrgMutationOrganizationUpdater(payload, store, viewerId, {...options, store, environment});
    },
    onCompleted,
    onError
  });
};

export default AddOrgMutation;

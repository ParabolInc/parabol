import {commitMutation} from 'react-relay';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveProjects from 'universal/mutations/handlers/handleRemoveProjects';
import handleRemoveTeamMembers from 'universal/mutations/handlers/handleRemoveTeamMembers';
import handleRemoveTeams from 'universal/mutations/handlers/handleRemoveTeams';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment RemoveTeamMemberMutation_project on RemoveTeamMemberOtherPayload {
    updatedProjects {
      id
      tags
      teamMemberId
      teamMember {
        id
        preferredName
        picture
      }
      userId
    }
  }
`;

graphql`
  fragment RemoveTeamMemberMutation_teamMember on RemoveTeamMemberPayload {
    teamMember {
      id
    }
  }
`;

graphql`
  fragment RemoveTeamMemberMutation_team on RemoveTeamMemberSelfPayload {
    updatedProjects {
      id
    }
    removedNotifications {
      id
    }
    notification {
      team {
        id
        name
      }
    }
    team {
      id
    }
  }
`;

const mutation = graphql`
  mutation RemoveTeamMemberMutation($teamMemberId: ID!) {
    removeTeamMember(teamMemberId: $teamMemberId) {
      ...RemoveTeamMemberMutation_teamMember @relay(mask: false)
      ...RemoveTeamMemberMutation_project @relay(mask: false)
      ...RemoveTeamMemberMutation_team @relay(mask: false)
    }
  }
`;

export const removeTeamMemberProjectsUpdater = (payload, store, viewerId) => {
  const type = payload.getValue('__typename');
  const projects = payload.getLinkedRecord('updatedProjects');
  if (type === 'RemoveTeamMemberSelfPayload') {
    const projectIds = getInProxy(projects, 'id');
    handleRemoveProjects(projectIds, store, viewerId);
  } else {
    handleUpsertProjects(projects, store, viewerId);
  }
};

export const removeTeamMemberTeamMemberUpdater = (payload, store) => {
  const teamMemberId = getInProxy(payload, 'teamMember', 'id');
  handleRemoveTeamMembers(teamMemberId, store);
};

export const removeTeamMemberTeamUpdater = (payload, store, viewerId, options) => {
  const notificationIds = getInProxy(payload, 'removedNotifications', 'id');
  handleRemoveNotifications(notificationIds, store, viewerId);

  const teamId = getInProxy(payload, 'team', 'id');
  handleRemoveTeams(teamId, store, viewerId);

  const notification = payload.getLinkedRecord('notification');
  handleAddNotifications(notification, options);
};

export const removeTeamMemberUpdater = (payload, store, viewerId, options) => {
  removeTeamMemberTeamMemberUpdater(payload, store);
  removeTeamMemberProjectsUpdater(payload, store, viewerId);
  removeTeamMemberTeamUpdater(payload, store, viewerId, options);
};

const RemoveTeamMemberMutation = (environment, teamMemberId, options) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {teamMemberId},
    updater: (store) => {
      const payload = store.getRootField('removeTeamMember');
      removeTeamMemberUpdater(payload, store, viewerId, {environment, store, ...options});
    }
  });
};

export default RemoveTeamMemberMutation;

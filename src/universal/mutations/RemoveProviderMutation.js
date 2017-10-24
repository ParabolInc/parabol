import {commitMutation} from 'react-relay';
import {GITHUB, SLACK} from 'universal/utils/constants';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';
import toGlobalId from 'universal/utils/relay/toGlobalId';

const mutation = graphql`
  mutation RemoveProviderMutation($providerId: ID!, $teamId: ID!) {
    removeProvider(providerId: $providerId teamId: $teamId) {
      providerRow {
        service
        accessToken
        userCount
        integrationCount
      }
      deletedIntegrationIds
      userId
    }
  }
`;

export const removeProviderUpdater = (viewer, teamId, service, mutatorUserId) => {
  const integrationProvider = viewer.getLinkedRecord('integrationProvider', {teamId, service});
  if (integrationProvider) {
    const {id: userId} = fromGlobalId(viewer.getDataID());
    if (service === SLACK || userId === mutatorUserId) {
      viewer.setValue(null, 'integrationProvider', {teamId, service});
    }
  }
};

export const updateProviderMap = (viewer, teamId, service, payload) => {
  const {id: userId} = fromGlobalId(viewer.getDataID());
  // update the providerMap if we have a matching viewerId
  const oldProviderMap = viewer.getLinkedRecord('providerMap', {teamId});
  if (!oldProviderMap) return;
  const oldProviderRow = oldProviderMap.getLinkedRecord(service);

  const newProviderRow = payload.getLinkedRecord('providerRow');
  const mutatorUserId = payload.getValue('userId');
  if (userId !== mutatorUserId) {
    newProviderRow.setValue(oldProviderRow.getValue('accessToken'), 'accessToken');
  }
  oldProviderMap.setLinkedRecord(newProviderRow, service);
};

export const removeIntegrations = (viewer, teamId, service, deletedIntegrationIds) => {
  if (service === SLACK) {
    viewer.setLinkedRecords([], 'slackChannels', {teamId});
  } else if (service === GITHUB) {
    const repos = viewer.getLinkedRecords('githubRepos', {teamId});
    if (!repos) return;
    const newNodes = getArrayWithoutIds(repos, deletedIntegrationIds);
    viewer.setLinkedRecords(newNodes, 'githubRepos', {teamId});
  }
};


const getIntegrationIdsToRemove = (viewer, teamId, service) => {
  const {id: userId} = fromGlobalId(viewer.getDataID());
  const teamMemberId = `${userId}::${teamId}`;
  const globalTeamMemberId = toGlobalId('TeamMember', teamMemberId);
  if (service === GITHUB) {
    const repos = viewer.getLinkedRecords('githubRepos', {teamId}) || [];
    return repos.reduce((arr, repo) => {
      const teamMembers = repo.getLinkedRecords('teamMembers');
      if (teamMembers.length === 1 && teamMembers[0].getValue('id') === globalTeamMemberId) {
        arr.push(repo.getDataID());
      }
      return arr;
    }, []);
  }
  // removeIntegrations ignores the value for SLACK, since it'll remove all
  return [];
};

export const removeUserFromIntegrations = (viewer, teamId, service, userId) => {
  if (service === GITHUB) {
    const repos = viewer.getLinkedRecords('githubRepos', {teamId});
    if (!repos) return;
    const teamMemberId = `${userId}::${teamId}`;
    const globalTeamMemberId = toGlobalId('TeamMember', teamMemberId);
    repos.forEach((repo) => {
      const teamMembers = repo.getLinkedRecords('teamMembers');
      const removedTeamMemberIdx = teamMembers.findIndex((teamMember) => teamMember.getValue('id') === globalTeamMemberId);
      if (removedTeamMemberIdx !== -1) {
        const updatedTeamMembers = [...teamMembers.slice(0, removedTeamMemberIdx), ...teamMembers.slice(removedTeamMemberIdx + 1)];
        repo.setLinkedRecords(updatedTeamMembers, 'teamMembers');
      }
    });
  }
};

let tempId = 0;
const RemoveProviderMutation = (environment, providerId, service, teamId) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {providerId, teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('removeProvider');

      // remove the accessToken from the provider
      const userId = payload.getValue('userId');
      removeProviderUpdater(viewer, teamId, service, userId);

      // update the userCount & integrationCount (and accessToken if mutator == viewer)
      updateProviderMap(viewer, teamId, service, payload);

      // update the integrations that exclusively belonged to this provider
      const deletedIntegrationIds = payload.getValue('deletedIntegrationIds');
      removeIntegrations(viewer, teamId, service, deletedIntegrationIds);

      // update the integrations that had > 1 member
      removeUserFromIntegrations(viewer, teamId, service, userId);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      const {userId: mutatorUserId} = environment;
      // remove the accessToken from the provider
      removeProviderUpdater(viewer, teamId, service, mutatorUserId);

      // update the integrations that exclusively belonged to this provider
      const deletedIntegrationIds = getIntegrationIdsToRemove(viewer, teamId, service);
      removeIntegrations(viewer, teamId, service, deletedIntegrationIds);

      // update the userCount & integrationCount (and access token if mutator == viewer)
      const {id: userId} = fromGlobalId(viewer.getDataID());
      const oldProviderMap = viewer.getLinkedRecord('providerMap', {teamId});
      if (oldProviderMap) {
        const oldProviderRow = oldProviderMap.getLinkedRecord(service);
        const oldUserCount = oldProviderRow.getValue('userCount') || 1;
        const oldIntegrationCount = oldProviderRow.getValue('integrationCount') || deletedIntegrationIds.length;
        const providerRow = store.create(`client:ProviderRow:${tempId++}`, 'ProviderRow')
          .setValue(service, 'service')
          .setValue(null, 'accessToken')
          .setValue(oldUserCount - 1, 'userCount')
          .setValue(oldIntegrationCount - deletedIntegrationIds.length, 'integrationCount');
        const payload = store.create(`client:removeProvider:${tempId++}`, 'RemoveProviderPayload')
          .setValue(userId, 'userId')
          .setLinkedRecord(providerRow, 'providerRow');
        updateProviderMap(viewer, teamId, service, payload);
      }

      removeUserFromIntegrations(viewer, teamId, service, userId);
    },
    onError: (err) => {
      console.error('err', err);
    }
  });
};

export default RemoveProviderMutation;

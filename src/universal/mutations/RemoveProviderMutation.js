import {commitMutation} from 'react-relay';
import {GITHUB, SLACK} from 'universal/utils/constants';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

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

export const removeProviderUpdater = (viewer, teamId, service) => {
  const integrationProvider = viewer.getLinkedRecord('integrationProvider', {teamId, service});
  if (integrationProvider) {
    viewer.setValue(null, 'integrationProvider', {teamId, service});
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
``
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


const getLocalIdsToRemove = (viewer, teamId, service) => {
  const {id: userId} = fromGlobalId(viewer.getDataID());
  if (service === GITHUB) {
    const repos = viewer.getLinkedRecords('githubRepos', {teamId}) || [];
    return repos.reduce((arr, repo) => {
      const userIds = repo.getValue('userIds');
      if (userIds.length === 1 && userIds[0] === userId) {
        arr.push(repo.getDataId());
      }
      return arr;
    }, []);
  }
  // removeIntegrations ignores the value for SLACK, since it'll remove all
  return [];
};

let tempId = 0;
const RemoveProviderMutation = (environment, providerId, service, teamId, viewerId) => {
  return commitMutation(environment, {
    mutation,
    variables: {providerId, teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('removeProvider');

      // remove the accessToken from the provider
      removeProviderUpdater(viewer, teamId, service);

      // update the userCount & integrationCount (and access token if mutator == viewer)
      updateProviderMap(viewer, teamId, service, payload);

      // update the integrations that exclusively belonged to this provider
      const deletedIntegrationIds = payload.getValue('deletedIntegrationIds');
      removeIntegrations(viewer, teamId, service, deletedIntegrationIds);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);

      // remove the accessToken from the provider
      removeProviderUpdater(viewer, teamId, service);

      // update the integrations that exclusively belonged to this provider
      const deletedIntegrationIds = getLocalIdsToRemove(viewer, teamId, service);
      removeIntegrations(viewer, teamId, service, deletedIntegrationIds);

      // update the userCount & integrationCount (and access token if mutator == viewer)
      const {id: userId} = fromGlobalId(viewer.getDataID());
      const oldProviderMap = viewer.getLinkedRecord('providerMap', {teamId});
      if (!oldProviderMap) return;
      const oldProviderRow = oldProviderMap.getLinkedRecord(service);
      const oldUserCount = oldProviderRow.getValue('userCount') || 1;
      const oldIntegrationCount = oldProviderRow.getValue('integrationCount') || deletedIntegrationIds.length;
      const providerRow = store.create(`client:ProviderRow:${tempId++}`, 'ProviderRow');
      providerRow.setValue(service, 'service');
      providerRow.setValue(null, 'accessToken');
      providerRow.setValue(oldUserCount - 1, 'userCount');
      providerRow.setValue(oldIntegrationCount - deletedIntegrationIds.length, 'integrationCount');
      const payload = store.create(`client:removeProvider:${tempId++}`, 'RemoveProviderPayload');
      payload.setValue(userId, 'userId');
      payload.setLinkedRecord(providerRow, 'providerRow');
      updateProviderMap(viewer, teamId, service, payload);
    },
    onError: (err) => {
      console.log('err', err);
    }
  });
};

export default RemoveProviderMutation;

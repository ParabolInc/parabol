import {commitMutation} from 'react-relay';
import {SLACK} from 'universal/utils/constants';
import {removeSlackChannelUpdater} from 'universal/mutations/RemoveSlackChannelMutation';

const mutation = graphql`
  mutation RemoveProviderMutation($providerId: ID!, $teamId: ID!) {
    removeProvider(providerId: $providerId teamId: $teamId) {
      providerRow {
        service
        accessToken
      }
      deletedIntegrationIds
    }
  }
`;

export const removeProviderUpdater = (viewer, teamId, service) => {
  const integrationProvider = viewer.getLinkedRecord('integrationProvider', {teamId, service});
  if (integrationProvider) {
    // TODO necessary check on intProvider?
    viewer.setValue(null, 'integrationProvider', {teamId, service});
  }
};

const RemoveProviderMutation = (environment, providerId, service, teamId, viewerId) => {
  return commitMutation(environment, {
    mutation,
    variables: {providerId, teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('removeProvider');

      // remove the accessToken from the provider
      removeProviderUpdater(viewer, teamId, service);

      // remove the integrations that depend on this provider
      const deletedIntegrationIds = payload.getValue('deletedIntegrationIds');
      console.log('deletedIds', deletedIntegrationIds);

      if (service === SLACK) {
        viewer.setLinkedRecords([], 'slackChannels', {teamId});
      }
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);

      //
      removeProviderUpdater(viewer, teamId, service);

      // if the service is slack, we know this'll nuke all the integrations. if not, we'll need more info
      if (service === SLACK) {
        viewer.setLinkedRecords([], 'slackChannels', {teamId});
      }
    },
    onError: (err) => {
      console.log('err', err);
    }
  });
};

export default RemoveProviderMutation;

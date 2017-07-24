// import {updateProviderMapUpdater} from 'universal/mutations/RemoveProviderMutation';
const subscription = graphql`
  subscription ProviderAddedSubscription($teamId: ID!) {
    providerAdded(teamId: $teamId) {
      providerRow {
        service
        accessToken
        userCount
        integrationCount
      }
      provider {
        id
        accessToken
        service
      }
      joinedIntegrationIds
      teamMember {
        id
        preferredName
        picture
      }
    }
  }
`;

const addProviderUpdater = (store, viewer, teamId, payload) => {
  const newIntegrationProvider = payload.getLinkedRecord('provider');
  const newProviderRow = payload.getLinkedRecord('providerRow');
  const service = newProviderRow.getValue('service');

  const oldProviderMap = viewer.getLinkedRecord('providerMap', {teamId});
  if (newIntegrationProvider) {
    viewer.setLinkedRecord(newIntegrationProvider, 'integrationProvider', {teamId, service});
  } else if (oldProviderMap) {
    // if there is no provider, then the mutation was not caused by the viewer, so ignore the accessToken change
    const oldProviderRow = oldProviderMap.getLinkedRecord(service);
    newProviderRow.setValue(oldProviderRow.getValue('accessToken'), 'accessToken');
  }
  if (oldProviderMap) {
    oldProviderMap.getLinkedRecord(service).copyFieldsFrom(newProviderRow);
  }

  // join the existing integrations
  const joinedIntegrationIds = payload.getValue('joinedIntegrationIds');
  if (joinedIntegrationIds && joinedIntegrationIds.length > 0) {
    joinedIntegrationIds.forEach((globalId) => {
      const integration = store.get(globalId);
      if (!integration) return;
      const teamMembers = integration.getLinkedRecords('teamMembers');
      teamMembers.push(payload.getLinkedRecord('teamMember'));
      integration.setLinkedRecords(teamMembers, 'teamMembers');
    });
  }
};

const ProviderAddedSubscription = (environment, queryVariables) => {
  const {ensureSubscription, viewerId} = environment;
  const {teamId} = queryVariables;
  return ensureSubscription({
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('providerAdded');
      const viewer = store.get(viewerId);
      addProviderUpdater(store, viewer, teamId, payload);
    }
  });
};

export default ProviderAddedSubscription;

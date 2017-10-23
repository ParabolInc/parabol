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
        providerUserName
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
    const oldProviderRow = oldProviderMap.getLinkedRecord(service);
    // copyFieldsFrom is just plain bad news
    oldProviderRow.setValue(newProviderRow.getValue('userCount'), 'userCount');
    oldProviderRow.setValue(newProviderRow.getValue('integrationCount'), 'integrationCount');
    oldProviderRow.setValue(newProviderRow.getValue('accessToken'), 'accessToken');
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
  const {viewerId} = environment;
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('providerAdded');
      const viewer = store.get(viewerId);
      addProviderUpdater(store, viewer, teamId, payload);
    }
  };
};

export default ProviderAddedSubscription;

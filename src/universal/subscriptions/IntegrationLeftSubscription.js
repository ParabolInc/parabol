import {leaveIntegrationUpdater} from 'universal/mutations/LeaveIntegrationMutation';

const AddedSubscription = graphql`
  subscription IntegrationLeftSubscription($service: IntegrationService!, $teamId: ID!) {
    integrationLeft(service: $service, teamId: $teamId) {
      globalId
      userId
    }
  }
`;

const IntegrationLeftSubscription = (service, teamId, viewerId) => (ensureSubscription) => {
  return ensureSubscription({
    subscription: AddedSubscription,
    variables: {service, teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('integrationLeft');
      leaveIntegrationUpdater(store, viewer, teamId, payload);
    }
  });
};

export default IntegrationLeftSubscription;

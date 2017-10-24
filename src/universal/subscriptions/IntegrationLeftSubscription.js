import {leaveIntegrationUpdater} from 'universal/mutations/LeaveIntegrationMutation';

const subscription = graphql`
  subscription IntegrationLeftSubscription($service: IntegrationService!, $teamId: ID!) {
    integrationLeft(service: $service, teamId: $teamId) {
      globalId
      userId
    }
  }
`;

const IntegrationLeftSubscription = (service) => (environment, queryVariables) => {
  const {viewerId} = environment;
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {service, teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('integrationLeft');
      leaveIntegrationUpdater(store, viewer, teamId, payload);
    }
  };
};

export default IntegrationLeftSubscription;

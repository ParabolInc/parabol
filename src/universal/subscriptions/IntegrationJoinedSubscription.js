import {joinIntegrationUpdater} from 'universal/mutations/JoinIntegrationMutation';

const subscription = graphql`
  subscription IntegrationJoinedSubscription($service: IntegrationService!, $teamId: ID!) {
    integrationJoined(service: $service, teamId: $teamId) {
      globalId
      teamMember {
        id
        picture
        preferredName
      }
    }
  }
`;

const IntegrationJoinedSubscription = (service) => (environment, queryVariables) => {
  const {viewerId} = environment;
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {service, teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('integrationJoined');
      joinIntegrationUpdater(store, viewer, teamId, payload);
    }
  };
};

export default IntegrationJoinedSubscription;

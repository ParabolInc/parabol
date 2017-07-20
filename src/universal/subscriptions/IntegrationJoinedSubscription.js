import {joinIntegrationUpdater} from 'universal/mutations/JoinIntegrationMutation';

const AddedSubscription = graphql`
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

const IntegrationJoinedSubscription = (service, teamId, viewerId) => (ensureSubscription) => {
  return ensureSubscription({
    subscription: AddedSubscription,
    variables: {service, teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('integrationJoined');
      joinIntegrationUpdater(store, viewer, teamId, payload);
    }
  });
};

export default IntegrationJoinedSubscription;

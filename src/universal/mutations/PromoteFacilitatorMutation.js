import {commitMutation} from 'react-relay';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';

const mutation = graphql`
  mutation PromoteFacilitatorMutation($facilitatorId: ID!, $disconnectedFacilitatorId: ID) {
    promoteFacilitator(facilitatorId: $facilitatorId, disconnectedFacilitatorId: $disconnectedFacilitatorId) {
      team {
        activeFacilitator
      }
      notification {
        ...FacilitatorDisconnectedToastFrag @relay(mask: false)
      }
    }
  }
`;

const PromoteFacilitatorMutation = (environment, variables, dispatch, onError, onCompleted) => {
  const {facilitatorId} = variables;
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('promoteFacilitator');
      const notification = payload.getLinkedRecord('notification');
      handleAddNotifications(notification, {dispatch, environment, store});
    },
    optimisticUpdater: (store) => {
      const [, teamId] = facilitatorId.split('::');
      store.get(teamId)
        .setValue(facilitatorId, 'activeFacilitator');
    },
    onCompleted,
    onError
  });
};

export default PromoteFacilitatorMutation;

import {commitMutation} from 'react-relay';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const mutation = graphql`
  mutation PromoteFacilitatorMutation($facilitatorId: ID!, $disconnectedFacilitatorId: ID) {
    promoteFacilitator(facilitatorId: $facilitatorId, disconnectedFacilitatorId: $disconnectedFacilitatorId) {
      team {
        activeFacilitator
      }
    }
  }
`;

const PromoteFacilitatorMutation = (environment, input, onError, onCompleted) => {
  const {facilitatorId, disconnectedFacilitatorId} = input;
  return commitMutation(environment, {
    mutation,
    variables: {disconnectedFacilitatorId, facilitatorId},
    optimisticUpdater: (store) => {
      const {id} = fromGlobalId(facilitatorId);
      const [, teamId] = id.split('::');
      store.get(teamId)
        .setValue(id, 'activeFacilitator');
    },
    onCompleted,
    onError
  });
};

export default PromoteFacilitatorMutation;

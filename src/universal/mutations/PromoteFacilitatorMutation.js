import {commitMutation} from 'react-relay';

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
      const [, teamId] = facilitatorId.split('::');
      store.get(teamId)
        .setValue(facilitatorId, 'activeFacilitator');
    },
    onCompleted,
    onError
  });
};

export default PromoteFacilitatorMutation;

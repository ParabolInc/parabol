import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation PromoteFacilitatorMutation($facilitatorId: ID!) {
    promoteFacilitator(facilitatorId: $facilitatorId)
  }
`;

const PromoteFacilitatorMutation = (environment, facilitatorId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {facilitatorId},
    // updater: (store) => {
    // },
    onCompleted,
    onError
  });
};

export default PromoteFacilitatorMutation;

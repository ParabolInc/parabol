import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation RequestFacilitatorMutation($teamId: ID!) {
    requestFacilitator(teamId: $teamId)
  }
`;

const RequestFacilitatorMutation = (environment, teamId) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    onError: (err) => {
      // maybe pop a toast? a toast for a toast? too much toast?
      console.error('err', err);
    }
  });
};

export default RequestFacilitatorMutation;

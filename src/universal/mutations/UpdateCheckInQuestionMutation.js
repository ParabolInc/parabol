import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation UpdateCheckInQuestionMutation($teamId: ID! $checkInQuestion: String!) {
    updateCheckInQuestion(teamId: $teamId checkInQuestion: $checkInQuestion) {
      team {
        id
      }
    }
  }
`;

const UpdateCheckInQuestionMutation = (environment, teamId, checkInQuestion, onCompleted, onError) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId, checkInQuestion},
    // optimisticUpdater: (store) => {
    // TODO add this when we switch teams over to relay
    // },
    onCompleted,
    onError
  });
};

export default UpdateCheckInQuestionMutation;

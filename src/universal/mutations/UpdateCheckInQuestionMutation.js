import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation UpdateCheckInQuestionMutation($teamId: ID! $checkInQuestion: String!) {
    updateCheckInQuestion(teamId: $teamId checkInQuestion: $checkInQuestion) {
      team {
        checkInQuestion
      }
    }
  }
`;

const UpdateCheckInQuestionMutation = (environment, teamId, checkInQuestion, onCompleted, onError) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId, checkInQuestion},
    optimisticUpdater: (store) => {
      store.get(teamId)
        .setValue(checkInQuestion, 'checkInQuestion');
    },
    onCompleted,
    onError
  });
};

export default UpdateCheckInQuestionMutation;

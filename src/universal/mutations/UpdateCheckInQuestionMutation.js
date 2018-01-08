import {commitMutation} from 'react-relay';

graphql`
  fragment UpdateCheckInQuestionMutation_team on UpdateCheckInQuestionPayload {
    team {
      checkInQuestion
    }
  }
`;

const mutation = graphql`
  mutation UpdateCheckInQuestionMutation($teamId: ID! $checkInQuestion: String!) {
    updateCheckInQuestion(teamId: $teamId checkInQuestion: $checkInQuestion) {
      ...UpdateCheckInQuestionMutation_team @relay(mask: false)
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

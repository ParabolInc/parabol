import {commitMutation} from 'react-relay';
import handleMutationError from 'universal/mutations/handlers/handleMutationError';
import updateLocalStage from 'universal/utils/relay/updateLocalStage';

graphql`
  fragment StartNewMeetingMutation_team on StartNewMeetingPayload {
    error {
      title
      message
    }
    team {
      id
      meetingId
      newMeeting {
        ...CompleteNewMeetingFrag @relay(mask: false)
      }
    }
  }
`;

const mutation = graphql`
  mutation StartNewMeetingMutation($teamId: ID!, $meetingType: MeetingTypeEnum!) {
    startNewMeeting(teamId: $teamId, meetingType: $meetingType) {
      ...StartNewMeetingMutation_team @relay(mask: false)
    }
  }
`;

export const startNewMeetingTeamOnNext = (payload, context) => {
  const {environment} = context;
  const {error, team: {newMeeting: {id: meetingId, phases: [firstPhase]}}} = payload;
  updateLocalStage(environment, meetingId, firstPhase.stages[0].id);
  handleMutationError(error, context);
};

const StartNewMeetingMutation = (environment, variables, {history}, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      startNewMeetingTeamOnNext(res.startNewMeeting, {environment, history});
      if (onCompleted) {
        onCompleted(res, errors);
      }
    }
  });
};

export default StartNewMeetingMutation;

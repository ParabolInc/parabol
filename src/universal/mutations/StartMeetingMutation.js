import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation StartMeetingMutation($teamId: ID!) {
    startMeeting(teamId: $teamId) {
      team {
        checkInGreeting {
          content
          language
        }
        checkInQuestion
        id
        name
        meetingId
        activeFacilitator
        facilitatorPhase
        facilitatorPhaseItem
        meetingPhase
        meetingPhaseItem
      }
    }
  }
`;

const StartMeetingMutation = (environment, teamId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    onCompleted,
    onError
  });
};

export default StartMeetingMutation;

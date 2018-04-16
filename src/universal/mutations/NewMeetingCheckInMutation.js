import {commitMutation} from 'react-relay';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

graphql`
  fragment NewMeetingCheckInMutation_team on NewMeetingCheckInPayload {
    meeting {
      ... on RetrospectiveMeeting {
        votesRemaining
      }
    }
    meetingMember {
      isCheckedIn
    }
  }
`;

const mutation = graphql`
  mutation NewMeetingCheckInMutation($meetingId: ID!, $userId: ID!, $isCheckedIn: Boolean) {
    newMeetingCheckIn(meetingId: $meetingId, userId: $userId, isCheckedIn: $isCheckedIn) {
      error {
        message
      }
      ...NewMeetingCheckInMutation_team @relay(mask: false)
    }
  }
`;

const NewMeetingCheckInMutation = (environment, variables, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, userId, isCheckedIn} = variables;
      const meetingMemberId = toTeamMemberId(meetingId, userId);
      store.get(meetingMemberId)
        .setValue(isCheckedIn, 'isCheckedIn');
    },
    onCompleted,
    onError
  });
};

export default NewMeetingCheckInMutation;

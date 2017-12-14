import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation MeetingCheckInMutation($teamMemberId: ID!, $isCheckedIn: Boolean) {
    meetingCheckIn(teamMemberId: $teamMemberId, isCheckedIn: $isCheckedIn) {
      teamMember {
        isCheckedIn
      }
    }
  }
`;

const MeetingCheckInMutation = (environment, teamMemberId, isCheckedIn, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamMemberId, isCheckedIn},
    optimisticUpdater: (store) => {
      store.get(teamMemberId)
        .setValue(isCheckedIn, 'isCheckedIn');
    },
    onCompleted,
    onError
  });
};

export default MeetingCheckInMutation;

import {commitMutation} from 'react-relay';

graphql`
  fragment MeetingCheckInMutation_teamMember on MeetingCheckInPayload {
    teamMember {
      isCheckedIn
    }
  }
`;

const mutation = graphql`
  mutation MeetingCheckInMutation($teamMemberId: ID!, $isCheckedIn: Boolean) {
    meetingCheckIn(teamMemberId: $teamMemberId, isCheckedIn: $isCheckedIn) {
      ...MeetingCheckInMutation_teamMember @relay(mask: false)
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

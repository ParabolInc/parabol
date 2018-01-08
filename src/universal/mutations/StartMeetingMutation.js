import {commitMutation} from 'react-relay';
import {CHECKIN} from 'universal/utils/constants';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';

graphql`
  fragment StartMeetingMutation_team on StartMeetingPayload {
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
`;

const mutation = graphql`
  mutation StartMeetingMutation($teamId: ID!) {
    startMeeting(teamId: $teamId) {
      ...StartMeetingMutation_team @relay(mask: false)
    }
  }
`;

const StartMeetingMutation = (environment, teamId, history, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    optimisticUpdater: (store) => {
      const {userId} = environment;
      const activeFacilitator = `${userId}::${teamId}`;
      const optimisticCheckInGreeting = {
        content: 'Hello',
        language: ''
      };

      const checkInGreeting = createProxyRecord(store, 'MeetingGreeting', optimisticCheckInGreeting);
      store.get(teamId)
        .setLinkedRecord(checkInGreeting, 'checkInGreeting')
        .setValue(makeEmptyStr(), 'checkInQuestion')
        .setValue(activeFacilitator, 'activeFacilitator')
        .setValue(CHECKIN, 'facilitatorPhase')
        .setValue(1, 'facilitatorPhaseItem')
        .setValue(CHECKIN, 'meetingPhase')
        .setValue(1, 'meetingPhaseItem');
      history.push(`/meeting/${teamId}/checkin/1`);
    },
    onCompleted,
    onError
  });
};

export default StartMeetingMutation;

import {commitMutation} from 'react-relay';
import {SUMMARY} from 'universal/utils/constants';

const mutation = graphql`
  mutation EndMeetingMutation($teamId: ID!) {
    endMeeting(teamId: $teamId) {
      team {
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

const EndMeetingMutation = (environment, teamId, history, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    optimisticUpdater: (store) => {
      store.get(teamId)
        .setValue(null, 'activeFacilitator')
        .setValue(SUMMARY, 'facilitatorPhase')
        .setValue(null, 'facilitatorPhaseItem')
        .setValue(SUMMARY, 'meetingPhase')
        .setValue(null, 'meetingPhaseItem');
      history.push(`/meeting/${teamId}/summary`);
    },
    onCompleted,
    onError
  });
};

export default EndMeetingMutation;

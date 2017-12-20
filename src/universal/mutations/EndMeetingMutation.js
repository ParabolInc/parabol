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
      const team = store.get(teamId);
      const meetingId = team.getValue('meetingId');
      history.push(`/summary/${meetingId}`);
      team
        .setValue(null, 'activeFacilitator')
        .setValue(SUMMARY, 'facilitatorPhase')
        .setValue(null, 'facilitatorPhaseItem')
        .setValue(SUMMARY, 'meetingPhase')
        .setValue(null, 'meetingPhaseItem');
    },
    onCompleted,
    onError
  });
};

export default EndMeetingMutation;

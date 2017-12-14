import {commitMutation} from 'react-relay';
import {LOBBY} from 'universal/utils/constants';

const mutation = graphql`
  mutation KillMeetingMutation($teamId: ID!) {
    killMeeting(teamId: $teamId) {
      team {
        activeFacilitator
        facilitatorPhase
        facilitatorPhaseItem
        meetingId
        meetingPhase
        meetingPhaseItem
      }
    }
  }
`;

const KillMeetingMutation = (environment, teamId, history, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    optimisticUpdater: (store) => {
      store.get(teamId)
        .setValue(LOBBY, 'facilitatorPhase')
        .setValue(LOBBY, 'meetingPhase')
        .setValue(null, 'meetingId')
        .setValue(null, 'facilitatorPhaseItem')
        .setValue(null, 'meetingPhaseItem')
        .setValue(null, 'activeFacilitator');
      history.push(`/meeting/${teamId}/lobby`);
    },
    onCompleted,
    onError
  });
};

export default KillMeetingMutation;

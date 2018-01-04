import {commitMutation} from 'react-relay';
import {SUMMARY} from 'universal/utils/constants';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment EndMeetingMutation_team on EndMeetingPayload {
    team {
      id
      meetingId
      # TODO team members, too?
    }
  }
`;

const mutation = graphql`
  mutation EndMeetingMutation($teamId: ID!) {
    endMeeting(teamId: $teamId) {
      ...EndMeetingMutation_team @relay(mask: false)
    }
  }
`;

const handleEndMeeting = (teamId, store) => {
  const team = store.get(teamId);
  if (!team) return;
  team
    .setValue(null, 'activeFacilitator')
    .setValue(SUMMARY, 'facilitatorPhase')
    .setValue(null, 'facilitatorPhaseItem')
    .setValue(SUMMARY, 'meetingPhase')
    .setValue(null, 'meetingPhaseItem')
    .setValue(null, 'meetingId');
};

export const endMeetingTeamUpdater = (payload, store) => {
  const teamId = getInProxy(payload, 'team', 'id');
  handleEndMeeting(teamId, store);
};

const EndMeetingMutation = (environment, teamId, history, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('endMeeting');
      endMeetingTeamUpdater(payload, store);
    },
    optimisticUpdater: (store) => {
      const team = store.get(teamId);
      const meetingId = team.getValue('meetingId');
      history.push(`/summary/${meetingId}`);
      handleEndMeeting(teamId, store);
    },
    onCompleted,
    onError
  });
};

export default EndMeetingMutation;

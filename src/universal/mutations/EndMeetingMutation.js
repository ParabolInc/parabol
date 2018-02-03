import {commitMutation} from 'react-relay';
import {SUMMARY} from 'universal/utils/constants';
import getInProxy from 'universal/utils/relay/getInProxy';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';

graphql`
  fragment EndMeetingMutation_team on EndMeetingPayload {
    team {
      id
      activeFacilitator
      meetingId
      meetingPhase
      meetingPhaseItem
      facilitatorPhase
      facilitatorPhaseItem
      # TODO team members, too?
    }
    meeting {
      id
    }
  }
`;

graphql`
  fragment EndMeetingMutation_project on EndMeetingPayload {
    archivedProjects {
      id
      tags
      teamId
    }
  }
`;

const mutation = graphql`
  mutation EndMeetingMutation($teamId: ID!) {
    endMeeting(teamId: $teamId) {
      ...EndMeetingMutation_team @relay(mask: false)
      ...EndMeetingMutation_project @relay(mask: false)
    }
  }
`;

const clearAgendaItems = (team) => team.setLinkedRecords([], 'agendaItems');

export const endMeetingTeamUpdater = (payload, {history}) => {
  clearAgendaItems(payload.getLinkedRecord('team'));
  const meetingId = getInProxy(payload, 'meeting', 'id');
  history.push(`/summary/${meetingId}`);
};

export const endMeetingProjectUpdater = (payload, store, viewerId) => {
  const archivedProjects = payload.getLinkedRecords('archivedProjects');
  handleUpsertProjects(archivedProjects, store, viewerId);
};

const EndMeetingMutation = (environment, teamId, history, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('endMeeting');
      endMeetingTeamUpdater(payload, {history});
      endMeetingProjectUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const team = store.get(teamId);
      const meetingId = team.getValue('meetingId');
      team
        .setValue(null, 'activeFacilitator')
        .setValue(SUMMARY, 'facilitatorPhase')
        .setValue(null, 'facilitatorPhaseItem')
        .setValue(SUMMARY, 'meetingPhase')
        .setValue(null, 'meetingPhaseItem')
        .setValue(null, 'meetingId');
      history.push(`/summary/${meetingId}`);
    },
    onCompleted,
    onError
  });
};

export default EndMeetingMutation;

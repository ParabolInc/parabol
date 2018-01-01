import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import {LOBBY, SUMMARY} from 'universal/utils/constants';

const subscription = graphql`
  subscription MeetingUpdatedSubscription($teamId: ID!) {
    meetingUpdated(teamId: $teamId) {
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
      completedAgendaItem {
        isComplete
      }
      notification {
        ...FacilitatorDisconnectedToastFrag @relay(mask: false)
      }
    }
  }
`;

const handleResetMeeting = (team, history) => {
  const facilitatorPhase = team.getValue('facilitatorPhase');
  const meetingId = team.getValue('meetingId');
  if (facilitatorPhase === SUMMARY) {
    history.replace(`/summary/${meetingId}`);
    team.setValue(null, 'meetingId')
      .setValue(LOBBY, 'facilitatorPhase')
      .setValue(LOBBY, 'meetingPhasePhase');
  }
};

const MeetingUpdatedSubscription = (environment, queryVariables, {dispatch, history}) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('meetingUpdated');
      const notification = payload.getLinkedRecord('notification');
      const team = payload.getLinkedRecord('team');
      handleResetMeeting(team, history);
      handleAddNotifications(notification, {dispatch, environment, store});
    }
  };
};

export default MeetingUpdatedSubscription;

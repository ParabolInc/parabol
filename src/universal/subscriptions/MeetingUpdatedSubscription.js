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
    }
  }
`;

const MeetingUpdatedSubscription = (environment, queryVariables, {history}) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const team = store.getRootField('meetingUpdated').getLinkedRecord('team');
      const facilitatorPhase = team.getValue('facilitatorPhase');
      const meetingId = team.getValue('meetingId');
      if (facilitatorPhase === SUMMARY) {
        history.replace(`/summary/${meetingId}`);
        team.setValue(null, 'meetingId')
          .setValue(LOBBY, 'facilitatorPhase')
          .setValue(LOBBY, 'meetingPhasePhase');
      }
    }
  };
};

export default MeetingUpdatedSubscription;

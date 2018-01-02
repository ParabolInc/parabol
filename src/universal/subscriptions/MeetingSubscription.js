import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import {LOBBY, SUMMARY} from 'universal/utils/constants';

const subscription = graphql`
  subscription MeetingSubscription($teamId: ID!) {
    meetingSubscription(teamId: $teamId) {
      __typename
      ... on MeetingMoved {
        team {
          facilitatorPhase
          facilitatorPhaseItem
          meetingPhase
          meetingPhaseItem
        }
        completedAgendaItem {
          isComplete
        }
      }
      ... on MeetingFacilitatorChanged {
        team {
          activeFacilitator
        }
        notification {
          ...FacilitatorDisconnectedToastFrag @relay(mask: false)
        }
      }
      ... on MeetingUpdated {
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

const MeetingSubscription = (environment, queryVariables, {dispatch, history}) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('meetingSubscription');
      const type = payload.getValue('__typename');
      if (type === 'MeetingUpdated') {
        const team = payload.getLinkedRecord('team');
        handleResetMeeting(team, history);
      } else if (type === 'MeetingFacilitatorChanged') {
        const notification = payload.getLinkedRecord('notification');
        handleAddNotifications(notification, {dispatch, environment, store});
      }
    }
  };
};

export default MeetingSubscription;

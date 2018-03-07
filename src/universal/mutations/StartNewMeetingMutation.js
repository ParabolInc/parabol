import {commitMutation} from 'react-relay';
import {meetingTypeToSlug, phaseTypeToSlug} from 'universal/utils/meetings/lookups';

graphql`
  fragment StartNewMeetingMutation_team on StartNewMeetingPayload {
    team {
      id
      meetingId
      newMeeting {
        id
        createdAt
        facilitatorStageId
        facilitatorUserId
        meetingNumber
        meetingType
        phases {
          stages {
            isComplete
          }
          phaseType
          ... on CheckInPhase {
            checkInGreeting {
              content
              language
            }
            checkInQuestion
            stages {
              teamMember {
                preferredName
                picture
              }
            }
          }
          ... on ThinkPhase {
            focusedPhaseItemId
          }
          ... on DiscussPhase {
            stages {
              thoughtGroup {
                title
                voteCount
                retroThoughts {
                  isViewerCreator
                  content
                }
              }
            }
          }
        }
      }
    }
  }
`;

const mutation = graphql`
  mutation StartNewMeetingMutation($teamId: ID!, $meetingType: MeetingTypeEnum!) {
    startNewMeeting(teamId: $teamId, meetingType: $meetingType) {
      ...StartNewMeetingMutation_team @relay(mask: false)
    }
  }
`;

export const startNewMeetingTeamOnNext = (payload, {history}) => {
  const {team: {id: teamId, newMeeting: {meetingType, phases: [firstPhase]}}} = payload;
  const {phaseType} = firstPhase;
  const phaseSlug = phaseTypeToSlug[phaseType];
  const meetingTypeSlug = meetingTypeToSlug[meetingType];
  const phaseItemSlug = firstPhase.stages.length === 1 ? '' : 1;
  history.push(`/${meetingTypeSlug}/${teamId}/${phaseSlug}/${phaseItemSlug}`);
};

const StartNewMeetingMutation = (environment, variables, {history}, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onError,
    onCompleted: (res) => {
      startNewMeetingTeamOnNext(res.startNewMeeting, {history});
      if (onCompleted) {
        onCompleted(res);
      }
    }
  });
};

export default StartNewMeetingMutation;

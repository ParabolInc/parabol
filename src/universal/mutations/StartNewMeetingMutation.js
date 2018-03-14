import {commitMutation} from 'react-relay';
import {meetingTypeToSlug, phaseTypeToSlug} from 'universal/utils/meetings/lookups';
import handleMutationError from 'universal/mutations/handlers/handleMutationError';

graphql`
  fragment StartNewMeetingMutation_team on StartNewMeetingPayload {
    error {
      title
      message
    }
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

export const startNewMeetingTeamOnNext = (payload, context) => {
  const {history} = context;
  const {error, team: {id: teamId, newMeeting: {meetingType, phases: [firstPhase]}}} = payload;
  const {phaseType} = firstPhase;
  const phaseSlug = phaseTypeToSlug[phaseType];
  const meetingTypeSlug = meetingTypeToSlug[meetingType];
  const phaseItemSlug = firstPhase.stages.length === 1 ? '' : 1;
  history.push(`/${meetingTypeSlug}/${teamId}/${phaseSlug}/${phaseItemSlug}`);
  handleMutationError(error, context);
};

const StartNewMeetingMutation = (environment, variables, {history}, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      startNewMeetingTeamOnNext(res.startNewMeeting, {environment, history});
      if (onCompleted) {
        onCompleted(res, errors);
      }
    }
  });
};

export default StartNewMeetingMutation;

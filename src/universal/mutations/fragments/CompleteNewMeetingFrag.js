graphql`
  fragment CompleteNewMeetingFrag on NewMeeting {
    id
    facilitatorStageId
    facilitatorUserId
    facilitator {
      id
      preferredName
    }
    meetingNumber
    meetingType
    phases {
      id
      phaseType
      stages {
        id
        isComplete
        ... on NewMeetingTeamMemberStage {
          teamMemberId
          teamMember {
            id
            picture
            preferredName
          }
        }
      }
      ... on CheckInPhase {
        checkInGreeting {
          content
          language
        }
        checkInQuestion
      }
      ... on ReflectPhase {
        focusedPhaseItemId
      }
      ... on DiscussPhase {
        stages {
          reflectionGroup {
            title
            voteCount
            retroReflections {
              isViewerCreator
              content
            }
          }
        }
      }
    }
  }
`;

import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {getTeamHealthDiscussionId_meeting$key} from '~/__generated__/getTeamHealthDiscussionId_meeting.graphql'

// the thread of the stage the viewer is on. In the waiting room the results are still hidden, so the
// stage's thread has nothing to discuss yet
const getTeamHealthDiscussionId = (meetingRef: getTeamHealthDiscussionId_meeting$key) => {
  const {endedAt, localPhase, localStage, phases} = readInlineData(
    graphql`
      fragment getTeamHealthDiscussionId_meeting on TeamHealthMeeting @inline {
        endedAt
        localPhase {
          phaseType
        }
        localStage {
          id
        }
        # localStage is a client-side link into these records, so discussionId has to be selected
        # here to be fetched at all. Concrete type conditions rather than DiscussionThreadStage,
        # since relay can only match an abstract condition on a server-fetched field
        phases {
          stages {
            id
            ... on TeamHealthResponseStage {
              discussionId
            }
            ... on TeamHealthResultStage {
              discussionId
            }
          }
        }
      }
    `,
    meetingRef
  )
  if (localPhase?.phaseType === 'TEAM_HEALTH_RESULT' && !endedAt) return undefined
  return phases.flatMap(({stages}) => stages).find(({id}) => id === localStage?.id)?.discussionId
}

export default getTeamHealthDiscussionId

import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RecordProxy} from 'relay-runtime'
import type {JoinMeetingMutation as TJoinMeetingMutation} from '../__generated__/JoinMeetingMutation.graphql'
import type {JoinMeetingMutation_meeting$data} from '../__generated__/JoinMeetingMutation_meeting.graphql'
import type {SharedUpdater, StandardMutation} from '../types/relayMutations'

graphql`
  fragment JoinMeetingMutation_meeting on JoinMeetingSuccess {
    meeting {
      id
    }
    meetingMember {
      id
      userId
      user {
        id
        picture
        preferredName
        email
      }
      teamMember {
        id
        isSelf
      }
      ... on PokerMeetingMember {
        isSpectating
      }
      ... on TeamHealthMeetingMember {
        isSpectating
      }
    }
    stages {
      id
      isComplete
      isNavigable
      isNavigableByFacilitator
      isViewerReady
      readyUserIds
      phaseType
      suggestedTimeLimit
      suggestedEndTime
      scheduledEndTime
      isAsync
      timeRemaining
      ... on NewMeetingTeamMemberStage {
        sortOrder
        teamMemberId
        teamMember {
          id
          userId
          user {
            id
            picture
            preferredName
          }
        }
      }
      ... on TeamPromptResponseStage {
        meetingId
        teamId
        discussionId
        responses {
          id
          promptId
          content
          plaintextContent
          sharedAt
          updatedAt
          reactjis {
            id
            count
            isViewerReactji
            users {
              id
              preferredName
            }
          }
        }
        discussion {
          id
          thread(first: 1000) @connection(key: "DiscussionThread_thread") {
            edges {
              node {
                id
                createdByUser {
                  id
                  picture
                  preferredName
                }
              }
            }
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation JoinMeetingMutation($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...JoinMeetingMutation_meeting @relay(mask: false) @alias
    }
  }
`

const appendRecord = (parent: RecordProxy, field: string, record: RecordProxy) => {
  const records = parent.getLinkedRecords(field)
  if (!records) return
  const dataID = record.getDataID()
  if (records.some((existing) => existing?.getDataID() === dataID)) return
  parent.setLinkedRecords([...records, record], field)
}

// Join broadcasts can arrive in another order than the joins, so a joined stage goes before the first stage with a
// higher sortOrder. A fetched stage without one in the store was in the phase before any later join
const insertStage = (phase: RecordProxy, stage: RecordProxy) => {
  const stages = phase.getLinkedRecords('stages')
  if (!stages) return
  const stageId = stage.getDataID()
  if (stages.some((existing) => existing?.getDataID() === stageId)) return
  const sortOrder = stage.getValue('sortOrder')
  const nextStagePosition = stages.findIndex((existing) => {
    const existingSortOrder = existing?.getValue('sortOrder')
    return (
      typeof sortOrder === 'number' &&
      typeof existingSortOrder === 'number' &&
      existingSortOrder > sortOrder
    )
  })
  const insertAt = nextStagePosition === -1 ? stages.length : nextStagePosition
  phase.setLinkedRecords(stages.toSpliced(insertAt, 0, stage), 'stages')
}

export const joinMeetingMeetingUpdater: SharedUpdater<JoinMeetingMutation_meeting$data> = (
  payload,
  {store}
) => {
  const meetingId = payload.getLinkedRecord('meeting').getValue('id')
  const meeting = store.get(meetingId)
  if (!meeting) return
  appendRecord(meeting, 'meetingMembers', payload.getLinkedRecord('meetingMember'))
  const phases = meeting.getLinkedRecords('phases') ?? []
  payload.getLinkedRecords('stages').forEach((stage) => {
    const phaseType = stage.getValue('phaseType')
    const phase = phases.find((phase) => phase?.getValue('phaseType') === phaseType)
    if (phase) insertStage(phase, stage)
  })
}

const JoinMeetingMutation: StandardMutation<TJoinMeetingMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TJoinMeetingMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default JoinMeetingMutation

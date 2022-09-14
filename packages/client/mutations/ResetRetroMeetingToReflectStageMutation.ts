import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import Atmosphere from '~/Atmosphere'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import {
  ResetRetroMeetingToReflectStageMutation as TResetRetroMeetingToReflectStageMutation,
  ResetRetroMeetingToReflectStageMutationVariables
} from '../__generated__/ResetRetroMeetingToReflectStageMutation.graphql'
import getDiscussionThreadConn from './connections/getDiscussionThreadConn'

graphql`
  fragment ResetRetroMeetingToReflectStageMutation_meeting on ResetRetroMeetingToReflectStagePayload {
    meeting {
      id
      phases {
        id
        stages {
          id
          isComplete
          isNavigable
          isNavigableByFacilitator
        }
      }
      ... on RetrospectiveMeeting {
        viewerMeetingMember {
          id
          votesRemaining
        }
        votesRemaining
        reflectionGroups {
          id
          viewerVoteCount
          meetingId
          sortOrder
          promptId
          ...ReflectionGroupHeader_reflectionGroup @relay(mask: false)
          ...ReflectionGroupVoting_reflectionGroup @relay(mask: false)
          ...ReflectionGroup_reflectionGroup @relay(mask: false)
          ...ReflectionGroupTitleEditor_reflectionGroup @relay(mask: false)
          ...GroupingKanbanColumn_reflectionGroups @relay(mask: false)
          reflections {
            ...DraggableReflectionCard_reflection @relay(mask: false)
          }
          voteCount
        }
      }
      ...MeetingControlBar_meeting
    }
  }
`

const mutation = graphql`
  mutation ResetRetroMeetingToReflectStageMutation($meetingId: ID!) {
    resetRetroMeetingToReflectStage(meetingId: $meetingId) {
      error {
        message
      }
      ...ResetRetroMeetingToReflectStageMutation_meeting @relay(mask: false)
    }
  }
`

export const resetRetroMeetingToReflectStageUpdater: SharedUpdater<
  TResetRetroMeetingToReflectStageMutation['response']['resetRetroMeetingToReflectStage']
> = (payload, {store}) => {
  const meeting = payload.getLinkedRecord('meeting')
  if (!meeting) return
  const phases = meeting.getLinkedRecords('phases')
  if (!phases) return
  const discussPhase = phases.find((phase) => phase?.getValue('phaseType') === 'discuss')
  if (!discussPhase) return
  const stages = discussPhase.getLinkedRecords('stages')
  stages.forEach((stage) => {
    const discussionId = stage?.getValue('discussionId') as string
    const thread = getDiscussionThreadConn(store, discussionId)
    thread?.setLinkedRecords([], 'edges')
  })
}

const ResetRetroMeetingToReflectStageMutation: SimpleMutation<
  TResetRetroMeetingToReflectStageMutation
> = (atmosphere: Atmosphere, variables: ResetRetroMeetingToReflectStageMutationVariables) => {
  return commitMutation<TResetRetroMeetingToReflectStageMutation>(atmosphere, {
    mutation,
    updater: (store) => {
      const payload = store.getRootField('resetRetroMeetingToReflectStage')
      if (!payload) return
      resetRetroMeetingToReflectStageUpdater(payload, {store, atmosphere})
    },
    variables
  })
}

export default ResetRetroMeetingToReflectStageMutation
